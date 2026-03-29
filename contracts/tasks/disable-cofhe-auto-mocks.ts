import { task } from "hardhat/config";
import {
  TASK_COMPILE,
  TASK_TEST,
  TASK_TEST_GET_TEST_FILES,
  TASK_TEST_RUN_MOCHA_TESTS,
  TASK_TEST_RUN_SHOW_FORK_RECOMMENDATIONS,
  TASK_TEST_SETUP_TEST_ENVIRONMENT,
} from "hardhat/builtin-tasks/task-names";

task(TASK_TEST).setAction(
  async (
    {
      testFiles,
      noCompile,
      parallel,
      bail,
      grep,
    }: {
      testFiles: string[];
      noCompile: boolean;
      parallel: boolean;
      bail: boolean;
      grep?: string;
    },
    { run, network },
  ) => {
    if (!noCompile) {
      await run(TASK_COMPILE, { quiet: true });
    }

    const files = await run(TASK_TEST_GET_TEST_FILES, { testFiles });

    await run(TASK_TEST_SETUP_TEST_ENVIRONMENT);
    await run(TASK_TEST_RUN_SHOW_FORK_RECOMMENDATIONS);

    const testFailures = await run(TASK_TEST_RUN_MOCHA_TESTS, {
      testFiles: files,
      parallel,
      bail,
      grep,
    });

    if (network.name === "hardhat") {
      const stackTracesFailures = await network.provider.send("hardhat_getStackTraceFailuresCount");
      if (stackTracesFailures !== 0) {
        console.warn(
          `Failed to generate ${stackTracesFailures} stack traces. Run Hardhat with --verbose to learn more.`,
        );
      }
    }

    process.exitCode = testFailures;
    return testFailures;
  },
);
