import { Page, test } from "@playwright/test";
import { createModel } from "@xstate/test";
import { createMachine } from "xstate";
import { addTestsToMachine, dedupPathPlans } from "../src/utils";

const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBU4BcAEBbAhgYwAsBLAOzADoB5EjACQHsswMAFHGAYkoAcwaoArkQhwMsMHjRF6JRKG71YRKTLkgAHogDsADnIAmAMwAWE4YCsx8+YCcARlMAaEAE9EAWn0295uzp0ADIZa5gHmOiYAbAC+0c6osJi4hKQUAOJCIrBiEio09LwkHGn0GGilycRk2dzsYGoKSnlqmgjudpF25JFahmZhNoYBpobObm1aNuQ2AXZ9PXaW9nZ2sfHo2PhV6Zmi4pLS+YXFpeUY+FIAbspEorUwDYo3qkgaiHb6xgZa+rorxsZfmFjGN3uRjAFgd59AFIgEdJZIoY1iAEkktqkqDQALIY6oYe5gDgAYQANkQ8ABrDBgdRoPgQUhQTYpaqPJqHFoeCH6cgBLSwgI2SI2Xw6LQg1xgiFQnQwuEI4xIlFolnbLEYXGsu51EnkqkYUg3HCkjB4GT0uns56yV6tdyRHrTPzGFYWLSRLx2UETKYzOZwmxBzohLSxOIgEj0LJqVWVTHUOiMZhsB6vRo2rltQw6LorSZ2CUDCJKn3uIbmPl+QxI-ThPz6VYRuN4nbCPa5Q4YAp8a3NO2IcIGBE1uw2XS-cKjKVtD6GcFRD3+kz8-QqjbxsgarXbGp1PucgfZoMGYw2UzmSKWXw9Ms6SLgyH2HQ2OsvmFN9aJNUJmgAQQOa4pB1NN5CeftQFaJ0jDlfwZgRcwvHMH03QMR04TsAI60LLQQnXb9NwoP9MFpekSEZEhmUI7ICDAHARAAJwPF5II8Qw-HIfwVmFQFBhrCUUNmTjGxHRZQkBOt8PRbVyGIw0SGNU1zRIS1MFo+iwCY9NwMPViJmGcgHDguYx0dX4y0rIUZnhTDLyvd8pJ-MhmNtPT3B+PQjJfEzhU9LQy2CLRpnFSxYU+T1DBscNoiAA */
  createMachine({
    id: "Test machine",
    initial: "On Home Page",
    states: {
      "On Home Page": {
        on: {
          "Open guides section": {
            target: "Guides section open",
          },
        },
      },
      "Guides section open": {
        on: {
          "Go to machines page": {
            target: "On Machines page",
          },
          "Go to activities page": {
            target: "On Activities page",
          },
        },
      },
      "On Machines page": {
        on: {
          "Click extending machines": {
            target: "At extending machines header",
          },
          "Click initial context": {
            target: "At initial context header",
          },
        },
      },
      "On Activities page": {},
      "At extending machines header": {},
      "At initial context header": {},
    },
  });

const machineWithTests = addTestsToMachine(machine, {
  "On Home Page": async (page) => {
    await page.locator('text="JavaScript state machines and statecharts"');
  },
  "Guides section open": async (page) => {
    await page.locator('text="Machines"');
  },
  "On Machines page": async (page) => {
    await page.locator(
      'text="A state machine is a finite set of states that can transition to each other deterministically due to events."',
    );
  },
  "On Activities page": async (page) => {
    await page.locator(
      'text="Activites are deprecated and will be removed in XState version 5."',
    );
  },
  "At extending machines header": async (page) => {
    await page.locator('text="Existing machines can be extended"');
  },
  "At initial context header": async (page) => {
    await page.locator('text="Initial context"');
  },
});

const model = createModel<Page>(machineWithTests, {
  events: {
    "Open guides section": {
      exec: async (page) => {
        await page.click("text='Guides'");
      },
    },
    "Go to machines page": {
      exec: async (page) => {
        await page.click("text='Machines'");
      },
    },
    "Go to activities page": {
      exec: async (page) => {
        await page.click("text='Activities'");
      },
    },
    "Click extending machines": {
      exec: async (page) => {
        await page.click("text='Extending Machines'");
      },
    },
    "Click initial context": {
      exec: async (page) => {
        await page.click("text='Initial Context'");
      },
    },
  },
});

const pathPlans = model.getShortestPathPlans();

test.describe.configure({ mode: "parallel" });

test.describe("XState Docs", () => {
  dedupPathPlans(pathPlans).forEach((plan) => {
    test(plan.description, async ({ page }) => {
      await page.goto("https://xstate.js.org/docs");
      await page.waitForLoadState("load");
      await plan.test(page);
    });
  });
});
