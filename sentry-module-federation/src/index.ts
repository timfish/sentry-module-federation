import { Event, StackParser, StackFrame } from "@sentry/types";
import { defaultStackParser } from "@sentry/browser";

declare global {
  interface Window {
    __SMF_STACK_TRACES__?: Record<string, any | false>;
    __SMF_MODULES__?: Record<string, any>;
  }
}

export interface StackFrameWithModuleData extends StackFrame {
  moduleData?: any;
}

function ensureStacksAreParsed(parser: StackParser): void {
  for (const key of Object.keys(window.__SMF_STACK_TRACES__)) {
    // has this stack already been parsed, skip it?
    if (!window.__SMF_STACK_TRACES__?.[key]) {
      continue;
    }

    const data = window.__SMF_STACK_TRACES__[key];

    // Ensure this stack doesn't get parsed again
    window.__SMF_STACK_TRACES__[key] = false;

    const frames = parser(key);

    for (const frame of frames.reverse()) {
      if (frame.filename) {
        window.__SMF_MODULES__ = window.__SMF_MODULES__ || {};
        window.__SMF_MODULES__[frame.filename] = data;
        break;
      }
    }
  }
}

export function getFramesWithModuleData(
  event: Event
): StackFrameWithModuleData[] | undefined {
  if (!event.exception.values?.[0].stacktrace?.frames) {
    return undefined;
  }

  ensureStacksAreParsed(defaultStackParser);

  const outputFrames = [];

  // Sentry frames have the top of the stack at the end of the array
  for (const frame of event.exception.values[0].stacktrace.frames || []) {
    const frameWithModuleData: StackFrameWithModuleData = frame;
    frameWithModuleData.moduleData = window.__SMF_MODULES__[frame.filename];
    outputFrames.push(frameWithModuleData);
  }

  return outputFrames;
}
