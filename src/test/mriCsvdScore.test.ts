import { describe, expect, it } from "vitest";
import { calculateMriCsvd, emptyMriCsvdInputs, buildMriCsvdReport, type MriCsvdInputs } from "../lib/mriCsvdScore";
const complete: MriCsvdInputs = { ...emptyMriCsvdInputs, studyFazekas: 0, lacunes: 0, gca: 0, epvs: 0, epvsRegion: "basal ganglia", epvsProtocolVerified: true, microbleeds: 0 };
describe("MRI-CSVD-5 supplied scoring rules", () => {
  it("returns null rather than zero when five markers are unknown", () => {
    expect(calculateMriCsvd(emptyMriCsvdInputs)).toMatchObject({ totalScore: null, observedScore: 0, assessed: 0, status: "incomplete" });
  });
  it("scores study Fazekas >=2 and does not aggregate separate grades", () => {
    expect(calculateMriCsvd({ ...complete, studyFazekas: 1 }).components.wmh).toBe(0);
    expect(calculateMriCsvd({ ...complete, studyFazekas: 2 }).components.wmh).toBe(1);
    expect(calculateMriCsvd({ ...complete, studyFazekas: null, periventricularFazekas: 3, deepFazekas: 3 }).totalScore).toBeNull();
  });
  it("scores at least one lacune", () => {
    expect(calculateMriCsvd({ ...complete, lacunes: 1 }).components.lacunes).toBe(1);
    expect(calculateMriCsvd(complete).components.lacunes).toBe(0);
  });
  it("scores Pasquier GCA >=2", () => {
    expect(calculateMriCsvd({ ...complete, gca: 1 }).components.atrophy).toBe(0);
    expect(calculateMriCsvd({ ...complete, gca: 2 }).components.atrophy).toBe(1);
  });
  it("scores EPVS strictly above 10 only with verified regional protocol", () => {
    expect(calculateMriCsvd({ ...complete, epvs: 10 }).components.epvs).toBe(0);
    expect(calculateMriCsvd({ ...complete, epvs: 11 }).components.epvs).toBe(1);
    expect(calculateMriCsvd({ ...complete, epvs: 11, epvsProtocolVerified: false }).components.epvs).toBeNull();
    expect(calculateMriCsvd({ ...complete, epvsRegion: "" }).totalScore).toBeNull();
  });
  it("scores at least one microbleed", () => {
    expect(calculateMriCsvd({ ...complete, microbleeds: 1 }).components.microbleeds).toBe(1);
    expect(calculateMriCsvd(complete).components.microbleeds).toBe(0);
  });
  it("sums five binary markers to a maximum of 5", () => {
    expect(calculateMriCsvd(complete).totalScore).toBe(0);
    expect(calculateMriCsvd({ ...complete, studyFazekas: 3, lacunes: 4, gca: 3, epvs: 11, microbleeds: 2 }).totalScore).toBe(5);
  });
  it.each([-1, 0.5, NaN, Infinity])("rejects invalid count %s", value => {
    expect(calculateMriCsvd({ ...complete, lacunes: value })).toMatchObject({ totalScore: null, status: "invalid" });
  });
  it("rejects out-of-range grades including non-scoring raw grades", () => {
    expect(calculateMriCsvd({ ...complete, periventricularFazekas: 4 as MriCsvdInputs["periventricularFazekas"] }).status).toBe("invalid");
  });
  it("retains raw inputs and forbids EVT exclusion and invented risk estimates", () => {
    expect(buildMriCsvdReport(complete).rawInputs).toEqual(complete);
    expect(buildMriCsvdReport(complete).safety).toEqual({ evtExclusionAllowed: false, delayReperfusionAllowed: false, absoluteRiskAvailable: false, validatedRiskCategories: false });
  });
});