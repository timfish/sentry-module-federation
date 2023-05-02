import { EventProcessor, Exception, Integration } from "@sentry/types";

declare global {
  interface Window {
    __SMF_MODULES__?: Record<string, string>;
  }
}

export function registerModule(moduleName: string, moduleUrl: string) {
  if (!window.__SMF_MODULES__) {
    window.__SMF_MODULES__ = {};
  }

  window.__SMF_MODULES__[moduleUrl] = moduleName;
}

function getTopModuleFromException(exception: Exception): string | undefined {
  // Sentry frames have the top of the stack at the end of the array
  const reverseFrames = exception.stacktrace?.frames.reverse();

  for (const frame of reverseFrames) {
    const mod = window.__SMF_MODULES__[frame.filename];

    if (mod) {
      return mod;
    }
  }
}

export class ModuleFederationIntegration implements Integration {
  public static id: string = "ModuleFederationIntegration";

  public name: string = ModuleFederationIntegration.id;

  public setupOnce(
    addGlobalEventProcessor: (callback: EventProcessor) => void
  ) {
    addGlobalEventProcessor((event) => {
      if (event.exception?.values[0]) {
        const mod = getTopModuleFromException(event.exception?.values[0]);

        if (mod) {
          event.tags = {
            ...event.tags,
            module: mod,
          };
        }
      }
      console.log(event);
      return event;
    });
  }
}
