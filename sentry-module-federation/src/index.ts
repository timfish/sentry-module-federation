import {
  EventProcessor,
  Exception,
  Hub,
  Integration,
  StackParser,
} from "@sentry/types";

declare global {
  interface Window {
    __SMF_STACK_TRACES__?: Record<string, ModuleOptions | false>;
    __SMF_MODULES__?: Record<string, ModuleOptions>;
  }
}

interface ModuleOptions {
  tags?: Record<string, string>;
  release?: string;
}

export function registerModule(options: ModuleOptions) {
  const stack = new Error().stack;

  if (!window.__SMF_STACK_TRACES__) {
    window.__SMF_STACK_TRACES__ = {};
  }

  window.__SMF_STACK_TRACES__[stack] = options;
}

function ensureStacksAreParsed(parser: StackParser): void {
  for (const key of Object.keys(window.__SMF_STACK_TRACES__)) {
    // has this stack already been parsed, skip it?
    if (!window.__SMF_STACK_TRACES__?.[key]) {
      continue;
    }

    const options = window.__SMF_STACK_TRACES__[key] as ModuleOptions;

    // Ensure this stack doesn't get parsed again
    window.__SMF_STACK_TRACES__[key] = false;

    const frames = parser(key);

    for (const frame of frames.reverse()) {
      // ignore the top of the stack
      if (frame.function.endsWith("registerModule")) {
        continue;
      }

      if (frame.filename) {
        window.__SMF_MODULES__ = window.__SMF_MODULES__ || {};
        window.__SMF_MODULES__[frame.filename] = options;
        break;
      }
    }
  }
}

function getTopModuleFromException(
  parser: StackParser,
  exception: Exception
): ModuleOptions | undefined {
  ensureStacksAreParsed(parser);

  // Sentry frames have the top of the stack at the end of the array
  const reverseFrames = exception.stacktrace?.frames.reverse();
  for (const frame of reverseFrames) {
    const mod = window.__SMF_MODULES__[frame.filename];
    if (mod) {
      return mod;
    }
  }

  return undefined;
}

export class ModuleFederationIntegration implements Integration {
  public static id: string = "ModuleFederationIntegration";

  public name: string = ModuleFederationIntegration.id;

  public setupOnce(
    addGlobalEventProcessor: (callback: EventProcessor) => void,
    getCurrnetHub: () => Hub
  ) {
    const stackParser = getCurrnetHub().getClient()?.getOptions()?.stackParser;

    addGlobalEventProcessor((event) => {
      if (event.exception?.values[0]) {
        const moduleOptions = getTopModuleFromException(
          stackParser,
          event.exception?.values[0]
        );

        console.log("moduleOptions", moduleOptions);

        if (moduleOptions) {
          event.tags = {
            ...event.tags,
            ...moduleOptions.tags,
          };

          event.release = moduleOptions.release || event.release;
        }
      }

      console.log(event);
      return event;
    });
  }
}
