import { beforeAll, beforeEach } from "vitest";
import { snapshotAnvilState } from "./common";

beforeAll(snapshotAnvilState);
beforeEach(snapshotAnvilState);
