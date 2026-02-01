import { describe, expect, it } from "vitest";

import { decodeSaveString, encodeSaveString } from "../src/game/persistence";
import { createInitialState, getWatchModels } from "../src/game/state";

describe("persistence", () => {
  describe("wornWatchId", () => {
    it("roundtrips wornWatchId when valid and owned", () => {
      const baseState = createInitialState();
      const watchModels = getWatchModels();
      const model = watchModels[0];
      expect(model).toBeTruthy();
      if (!model) {
        return;
      }

      const seededState = {
        ...baseState,
        wornWatchId: model.id,
        watchModels: {
          ...baseState.watchModels,
          [model.id]: 1,
        },
      };

      const encoded = encodeSaveString(seededState, 0, new Date(0));
      const decoded = decodeSaveString(encoded);
      expect(decoded.ok).toBe(true);
      if (!decoded.ok) {
        return;
      }

      expect(decoded.save.state.wornWatchId).toBe(model.id);
    });

    it("defaults to null when wornWatchId is missing", () => {
      const baseState = createInitialState();
      const { wornWatchId, ...stateWithoutWornWatchId } = baseState;
      void wornWatchId;

      const raw = JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: 0,
        state: stateWithoutWornWatchId,
      });

      const decoded = decodeSaveString(raw);
      expect(decoded.ok).toBe(true);
      if (!decoded.ok) {
        return;
      }

      expect(decoded.save.state.wornWatchId).toBeNull();
    });

    it("sanitizes invalid wornWatchId values to null", () => {
      const baseState = createInitialState();
      const stateRecord = baseState as unknown as Record<string, unknown>;

      const raw = JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: 0,
        state: {
          ...stateRecord,
          wornWatchId: 123,
        },
      });

      const decoded = decodeSaveString(raw);
      expect(decoded.ok).toBe(true);
      if (!decoded.ok) {
        return;
      }

      expect(decoded.save.state.wornWatchId).toBeNull();
    });

    it("sanitizes unknown wornWatchId values to null", () => {
      const baseState = createInitialState();

      const raw = JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: 0,
        state: {
          ...baseState,
          wornWatchId: "not-a-watch-model",
        },
      });

      const decoded = decodeSaveString(raw);
      expect(decoded.ok).toBe(true);
      if (!decoded.ok) {
        return;
      }

      expect(decoded.save.state.wornWatchId).toBeNull();
    });
  });

  describe("career permanence fields", () => {
    it("defaults missing permanence fields to null", () => {
      const baseState = createInitialState();

      const raw = JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: 0,
        state: {
          ...baseState,
          therapistCareer: {
            ...baseState.therapistCareer,
            activeTrackId: "private-practice",
          },
        },
      });

      const decoded = decodeSaveString(raw);
      expect(decoded.ok).toBe(true);
      if (!decoded.ok) {
        return;
      }

      expect(decoded.save.state.therapistCareer.primaryTrackId).toBe("private-practice");
      expect(decoded.save.state.therapistCareer.activeTrackId).toBe("private-practice");
      expect(decoded.save.state.therapistCareer.modalityId).toBeNull();
      expect(decoded.save.state.therapistCareer.operatingStyleId).toBeNull();
      expect(decoded.save.state.therapistCareer.expansionFocusId).toBeNull();
    });

    it("pins activeTrackId to primaryTrackId when they disagree", () => {
      const baseState = createInitialState();

      const raw = JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: 0,
        state: {
          ...baseState,
          therapistCareer: {
            ...baseState.therapistCareer,
            activeTrackId: "va-hospital",
            primaryTrackId: "private-practice",
          },
        },
      });

      const decoded = decodeSaveString(raw);
      expect(decoded.ok).toBe(true);
      if (!decoded.ok) {
        return;
      }

      expect(decoded.save.state.therapistCareer.primaryTrackId).toBe("private-practice");
      expect(decoded.save.state.therapistCareer.activeTrackId).toBe("private-practice");
    });

    it("sanitizes invalid primaryTrackId values to null", () => {
      const baseState = createInitialState();
      const stateRecord = baseState as unknown as Record<string, unknown>;

      const raw = JSON.stringify({
        version: 2,
        savedAt: new Date(0).toISOString(),
        lastSimulatedAtMs: 0,
        state: {
          ...stateRecord,
          therapistCareer: {
            ...(stateRecord.therapistCareer as unknown as Record<string, unknown>),
            primaryTrackId: 123,
          },
        },
      });

      const decoded = decodeSaveString(raw);
      expect(decoded.ok).toBe(true);
      if (!decoded.ok) {
        return;
      }

      expect(decoded.save.state.therapistCareer.primaryTrackId).toBeNull();
    });
  });
});
