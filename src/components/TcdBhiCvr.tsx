import { useState } from "react";
import {
  ACOUSTIC_WINDOW,
  AGGREGATION,
  BASELINE_ACTIONS,
  BASELINE_DURATION_SECONDS,
  BASELINE_SOURCE_IDS,
  BREATH_HOLD_ACTIONS,
  BREATH_HOLD_SOURCE_IDS,
  CALCULATION_NOTES,
  IMPRESSION_TEMPLATE,
  INVALID_FOR_BHI,
  LIMITS_CATEGORICAL_INTERPRETATION,
  M1_STARTING_DEPTH_MM,
  MEASURE_NOTES,
  MINIMUM_INTERVAL_FROM_RELEASE_SECONDS,
  MINIMUM_RECOVERY_RECORDING_SECONDS,
  PATIENT_INSTRUCTION,
  PREFERRED_RECORDING,
  PROBE_FREQUENCY_MHZ,
  REPEAT_WHEN,
  REPORT_FIELDS,
  RESPONSE_VALUE,
  RESPONSE_WINDOW_ANCHOR,
  RESPONSE_WINDOW_DURATION_SECONDS,
  RESPONSE_WINDOW_START_SECONDS,
  SCREEN_ACTIONS,
  SCREEN_SOURCE_IDS,
  TARGET_BREATH_HOLD_SECONDS,
  TARGET_VALID_TRIALS_PER_SIDE,
  TCD_BHI_SECTION_ID,
  TCD_BHI_STATUS_LABEL,
  TCD_BHI_TITLE,
  TCD_HEADER_NOTES,
  TCD_REFERENCES,
  TCD_STEP_TITLES,
  TRIAL_QUALITY_INVALID,
  USUAL_ATTEMPTS,
  calculateBhi,
  formatBhi,
  formatPercentMfvChange,
  formatTcdBhiCopy,
  items,
  parseNumericInput,
} from "@/lib/tcdBhiCvr";
import {
  CheckList,
  CopyResult,
  Fact,
  Lines,
  NumericField,
  ProtocolCard,
  ProtocolInfoNote,
  ProtocolStep,
  ReferenceList,
  ResultBlock,
  copyPlainText,
  type CheckItem,
} from "@/components/protocolChrome";

const screenItems = items("screen", SCREEN_ACTIONS);
const baselineItems = items("baseline", BASELINE_ACTIONS);
const breathHoldItems = items("breath", BREATH_HOLD_ACTIONS);
const invalidItems = items("invalid", INVALID_FOR_BHI);
const limitItems = items("limits", LIMITS_CATEGORICAL_INTERPRETATION);
const orderedChecks: CheckItem[] = [
  ...screenItems,
  ...baselineItems,
  ...breathHoldItems,
  ...invalidItems,
  ...limitItems,
];

export default function TcdBhiCvr() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [baselineRaw, setBaselineRaw] = useState("");
  const [responseRaw, setResponseRaw] = useState("");
  const [secondsRaw, setSecondsRaw] = useState("");
  const [trialQualityInvalid, setTrialQualityInvalid] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const baseline = parseNumericInput(baselineRaw);
  const response = parseNumericInput(responseRaw);
  const seconds = parseNumericInput(secondsRaw);
  const result = calculateBhi(baseline, response, seconds, trialQualityInvalid);
  const checkedLabels = orderedChecks.filter((item) => checked[item.id]).map((item) => item.label);
  const copyText = formatTcdBhiCopy({
    checked: checkedLabels,
    baselineCmS: baseline,
    responseCmS: response,
    breathHoldSeconds: seconds,
    trialQualityInvalid,
  });

  const clearCopy = () => setCopiedText(null);
  const toggle = (id: string, value: boolean) => {
    setChecked((current) => ({ ...current, [id]: value }));
    clearCopy();
  };

  const resultLines = result
    ? [
        `MFV change: ${formatPercentMfvChange(result.percentMfvChange)}%`,
        `BHI: ${formatBhi(result.bhiPercentPerSecond)} %/s`,
      ]
    : [];

  return (
    <ProtocolCard
      id={TCD_BHI_SECTION_ID}
      title={TCD_BHI_TITLE}
      status={TCD_BHI_STATUS_LABEL}
      notes={TCD_HEADER_NOTES}
      notesLabel="Scope and modality"
    >
      <ProtocolStep title={TCD_STEP_TITLES[0]} notes={SCREEN_SOURCE_IDS} notesLabel="Screening sources">
        <CheckList items={screenItems} checked={checked} onToggle={toggle} />
      </ProtocolStep>

      <ProtocolStep title={TCD_STEP_TITLES[1]} notes={BASELINE_SOURCE_IDS} notesLabel="Baseline sources">
        <Fact label="Probe frequency" value={`${PROBE_FREQUENCY_MHZ} MHz`} />
        <Fact label="Window" value={ACOUSTIC_WINDOW} />
        <Fact label="Typical M1 starting depth" value={`${M1_STARTING_DEPTH_MM.min}–${M1_STARTING_DEPTH_MM.max} mm`} />
        <p className="text-sm leading-relaxed break-words">{PREFERRED_RECORDING}</p>
        <Fact label="Baseline duration" value={`${BASELINE_DURATION_SECONDS} seconds`} />
        <CheckList items={baselineItems} checked={checked} onToggle={toggle} />
      </ProtocolStep>

      <ProtocolStep title={TCD_STEP_TITLES[2]} notes={BREATH_HOLD_SOURCE_IDS} notesLabel="Breath-hold sources">
        <Fact label="Target duration" value={`${TARGET_BREATH_HOLD_SECONDS} seconds`} />
        <p className="text-sm leading-relaxed break-words">{PATIENT_INSTRUCTION}</p>
        <CheckList items={breathHoldItems} checked={checked} onToggle={toggle} />
      </ProtocolStep>

      <ProtocolStep title={TCD_STEP_TITLES[3]} notes={MEASURE_NOTES} notesLabel="Measurement notes">
        <Fact label="Response window anchor" value={RESPONSE_WINDOW_ANCHOR} />
        <Fact label="Response window start" value={`${RESPONSE_WINDOW_START_SECONDS} seconds`} />
        <Fact label="Response window duration" value={`${RESPONSE_WINDOW_DURATION_SECONDS} seconds`} />
        <p className="text-sm leading-relaxed break-words">{RESPONSE_VALUE}</p>
        <Fact label="Target valid trials per side" value={String(TARGET_VALID_TRIALS_PER_SIDE)} />
        <Fact label="Usual attempts" value={`${USUAL_ATTEMPTS.min}–${USUAL_ATTEMPTS.max}`} />
        <Fact label="Minimum recovery recording" value={`${MINIMUM_RECOVERY_RECORDING_SECONDS} seconds`} />
        <Fact label="Minimum interval from release to next hold" value={`${MINIMUM_INTERVAL_FROM_RELEASE_SECONDS} seconds`} />
        <p className="text-sm leading-relaxed break-words">{REPEAT_WHEN}</p>
        <p className="text-sm leading-relaxed break-words">{AGGREGATION}</p>
        <CheckList items={invalidItems} checked={checked} onToggle={toggle} />
        <CheckList items={limitItems} checked={checked} onToggle={toggle} />
      </ProtocolStep>

      <ProtocolStep title={TCD_STEP_TITLES[4]}>
        <div className="flex items-start gap-1">
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-3">
            <NumericField
              label="MFV baseline"
              unit="cm/s"
              value={baselineRaw}
              onChange={(value) => {
                setBaselineRaw(value);
                clearCopy();
              }}
            />
            <NumericField
              label="MFV response"
              unit="cm/s"
              value={responseRaw}
              onChange={(value) => {
                setResponseRaw(value);
                clearCopy();
              }}
            />
            <NumericField
              label="Breath-hold"
              unit="seconds"
              value={secondsRaw}
              onChange={(value) => {
                setSecondsRaw(value);
                clearCopy();
              }}
            />
          </div>
          <ProtocolInfoNote label="BHI calculation" notes={CALCULATION_NOTES} />
        </div>
        <CheckList
          items={[{ id: "trial-quality", label: TRIAL_QUALITY_INVALID }]}
          checked={{ "trial-quality": trialQualityInvalid }}
          onToggle={(_id, value) => {
            setTrialQualityInvalid(value);
            clearCopy();
          }}
        />
        <ResultBlock lines={resultLines} />
      </ProtocolStep>

      <ProtocolStep title={TCD_STEP_TITLES[5]}>
        <Lines items={REPORT_FIELDS} />
        <p className="text-sm leading-relaxed break-words">{IMPRESSION_TEMPLATE}</p>
      </ProtocolStep>

      <div className="space-y-3 py-3">
        <ReferenceList references={TCD_REFERENCES} />
        <CopyResult
          copied={copiedText != null}
          text={copyText}
          onCopy={() => {
            void copyPlainText(copyText).then(() => setCopiedText(copyText));
          }}
        />
      </div>
    </ProtocolCard>
  );
}
