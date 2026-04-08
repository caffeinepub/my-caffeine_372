// Wrap the core-infrastructure useActor with the project's createActor function
// so consumers can call useActor() with no arguments.
import { useActor as _useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { backendInterface } from "../backend";

export function useActor(): {
  actor: backendInterface | null;
  isFetching: boolean;
} {
  return _useActor(createActor);
}
