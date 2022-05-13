import { Page } from "@playwright/test";
import { TestPlan } from "@xstate/test/lib/types";
import { AnyStateMachine, StateMachine } from "xstate";

/**
 * Adds state.meta.test to machines by their state id -
 * allowing you to specify the tests separately to the
 * machine itself
 */
export const addTestsToMachine = (
  /**
   * The machine you want to add tests to
   */
  machine: AnyStateMachine,
  /**
   * The tests, specified as a keyed object, where:
   *
   * 1. Keys are the state ids
   * 2. Values are functions that take your test context
   *   and return a promise
   */
  tests: Record<string, (page: Page) => Promise<void>>,
) => {
  Object.entries(tests).forEach(([stateId, test]) => {
    const node = machine.getStateNodeById(`${machine.id}.${stateId}`);

    if (tests[stateId]) {
      node.meta = {
        test: tests[stateId],
      };
    }
  });

  return machine;
};

/**
 * Deduplicates your path plans so that A -> B
 * is not executed separately to A -> B -> C
 */
export const dedupPathPlans = <TTestContext>(
  pathPlans: TestPlan<TTestContext, any>[],
): TestPlan<TTestContext, any>[] => {
  const planPathSegments = pathPlans.map((plan) => {
    const planSegments = plan.paths[0].segments.map((segment) =>
      JSON.stringify(segment.event),
    );

    return planSegments;
  });

  /**
   * Filter out the paths that are just shorter versions
   * of other paths
   */
  const filteredPathPlans = pathPlans.filter((plan, index) => {
    const planSegments = planPathSegments[index];

    if (planSegments.length === 0) return false;

    const concatenatedPlanSegments = planSegments.join("");

    return !planPathSegments.some((planPathSegmentsToCompare) => {
      const concatenatedSegmentToCompare = planPathSegmentsToCompare.join("");
      /**
       * Filter IN (return false) if it's the same as the current plan,
       * because it's not a valid comparison
       */
      if (concatenatedSegmentToCompare === concatenatedPlanSegments) {
        return false;
      }

      /**
       * Filter IN (return false) if the plan to compare against has length 0
       */
      if (planPathSegmentsToCompare.length === 0) {
        return false;
      }

      /**
       * We filter OUT (return true)
       */
      return concatenatedSegmentToCompare.includes(concatenatedPlanSegments);
    });
  });

  return filteredPathPlans;
};
