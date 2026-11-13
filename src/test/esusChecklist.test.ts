import { describe, expect, it } from "vitest";
import {
  ESUS_ITEM_COUNT,
  ESUS_SECTIONS,
  ESUS_TITLE,
  classifyEsus,
  formatEsusChecklistCopy,
} from "@/lib/esusChecklist";

describe("ESUS checklist copy", () => {
  it("copies the checklist name, answered items, and the classification summary", () => {
    const text = formatEsusChecklistCopy({
      brain_imaging: "yes",
      relevant_stenosis: "no",
      ecg: "not_assessed",
      pfo: "uncertain",
      targeted_cardiac_imaging: "yes",
    });

    expect(text).toBe(
      [
        ESUS_TITLE,
        "Brain CT or MRI reviewed: Yes",
        "No ≥50% atherosclerotic stenosis in a supplying artery: No",
        "PFO / right-to-left shunt: shunt size, atrial septal aneurysm, DVT/PE clues: Uncertain",
        "Targeted TEE or cardiac CT/MRI for suspected cardiac or aortic sources: Yes",
        "ESUS criteria not met",
      ].join("\n"),
    );
    expect(text).not.toMatch(/https?:\/\//);
    expect(text).not.toContain("Was brain CT or MRI performed and reviewed?");
  });

  it("omits unanswered items and reports an incomplete evaluation", () => {
    expect(formatEsusChecklistCopy({})).toBe(
      `${ESUS_TITLE}\nEvaluation incomplete or indeterminate`,
    );
    expect(classifyEsus({ nonlacunar_infarct: "uncertain" })).toBe("evaluation_incomplete_or_indeterminate");
  });

  it("reports criteria met only when minimum evaluation and classification match", () => {
    const answers = {
      brain_imaging: "yes" as const,
      arterial_imaging: "yes" as const,
      ecg: "yes" as const,
      echo: "yes" as const,
      initial_rhythm_monitoring: "yes" as const,
      clinical_review: "yes" as const,
      nonlacunar_infarct: "yes" as const,
      relevant_stenosis: "yes" as const,
      major_cardioembolic_source: "yes" as const,
      other_specific_cause: "yes" as const,
      atrial_cardiopathy: "yes" as const,
      fdg_pet: "not_applicable" as const,
    };
    const text = formatEsusChecklistCopy(answers);
    expect(text.endsWith("Meets ESUS criteria after minimum evaluation")).toBe(true);
    expect(text).toContain("Atrial cardiopathy: NT-proBNP, ECG P-wave indices and LA size: Yes");
    expect(text).toContain("Consider whole-body FDG PET/CT if occult cancer is suspected: Not applicable");
    expect(text).not.toContain("Not assessed");
    expect(ESUS_SECTIONS.map((section) => section.title)).toEqual([
      "Minimum evaluation",
      "ESUS criteria",
      "Cardiac and paradoxical sources",
      "Arterial and aortic sources",
      "Cancer and procoagulant states",
    ]);
    expect(ESUS_ITEM_COUNT).toBe(29);
  });
});
