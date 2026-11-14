import { useState } from "react";
import {
  ACQUIRE_M0,
  ADULT_DOSE_MG,
  ANATOMICAL_SEQUENCES,
  ASL_CVR_HEADER_NOTES,
  ASL_CVR_REFERENCES,
  ASL_CVR_SECTION_ID,
  ASL_CVR_STATUS_LABEL,
  ASL_CVR_TITLE,
  ASL_STEP_TITLES,
  AVOID,
  AVOIDANCE_INTERVAL_HOURS,
  BASELINE_ACQUISITION,
  BASELINE_OBSERVATIONS,
  CALCULATION_NOTES,
  CBF_UNIT,
  CRUSH_EVIDENCE_NOTE,
  DELAYED_TRANSIT_STRATEGY,
  DOSE_MONITOR,
  DOSE_NOTES,
  DOSE_RECORD,
  DO_NOT_CRUSH_EXTENDED_RELEASE,
  DRUG_BRAND_EXAMPLE,
  DRUG_GENERIC_NAME,
  DRUG_ROUTE,
  EXAMPLE_LABELING_DURATION_MS,
  EXAMPLE_SINGLE_PLD_MS,
  INTERPRETATION_NOTES,
  PCASL_SEQUENCE,
  PCASL_SOURCE_IDS,
  PEDIATRIC_CAP_CANDIDATES_MG,
  PEDIATRIC_MG_PER_KG,
  POST_CHALLENGE_ACQUISITION,
  POST_DOSE_UNIT,
  PREPARATION_METHOD,
  PROCESSING,
  RECORD_SCAN_TIMES,
  RECOVERY_ACTIONS,
  RECOVERY_SOURCE_IDS,
  REPORTABLE_PATTERNS,
  REPORT_FIELDS,
  REQUIRES_LOCAL_VALIDATION,
  RESTING_CONDITIONS,
  SCREENING_ACTIONS,
  SCREENING_ITEMS,
  SERIAL_SCAN_MINUTES,
  SUPPLIED_WORKFLOW_PARAMETER,
  TIMING_NOTES,
  TIMING_WINDOW_MINUTES,
  URGENT_ACTION,
  VOID_BEFORE_IMAGING,
  WITHHOLD_ACTION,
  WITHHOLD_SOURCE_IDS,
  ZERO_EVENT,
  calculateCvrPercent,
  formatAslCvrCopy,
  formatCvrPercent,
  parseCbfInput,
} from "@/lib/acetazolamideAslCvr";
import {
  CheckList,
  CopyResult,
  Fact,
  Lines,
  NoteRow,
  NumericField,
  ProtocolCard,
  ProtocolInfoNote,
  ProtocolStep,
  ReferenceList,
  ResultBlock,
  StatusMark,
  copyPlainText,
} from "@/components/protocolChrome";

const screeningChecks = SCREENING_ITEMS.map((label) => ({ id: label, label }));

export default function AcetazolamideAslCvr() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [preRaw, setPreRaw] = useState("");
  const [postRaw, setPostRaw] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const cbfPre = parseCbfInput(preRaw);
  const cbfPost = parseCbfInput(postRaw);
  const cvr = calculateCvrPercent(cbfPre, cbfPost);
  const checkedScreening = SCREENING_ITEMS.filter((item) => checked[item]);
  const copyText = formatAslCvrCopy({ checkedScreening, cbfPre, cbfPost });

  const clearCopy = () => setCopiedText(null);
  const toggle = (id: string, value: boolean) => {
    setChecked((current) => ({ ...current, [id]: value }));
    clearCopy();
  };

  return (
    <ProtocolCard
      id={ASL_CVR_SECTION_ID}
      title={ASL_CVR_TITLE}
      status={ASL_CVR_STATUS_LABEL}
      notes={ASL_CVR_HEADER_NOTES}
      notesLabel="Purpose, evidence scope, and local parameters to confirm"
    >
      <ProtocolStep title={ASL_STEP_TITLES[0]}>
        <CheckList items={screeningChecks} checked={checked} onToggle={toggle} />
        <NoteRow text={WITHHOLD_ACTION} notes={WITHHOLD_SOURCE_IDS} label="Withhold sources" />
        {SCREENING_ACTIONS.map((action) => (
          <NoteRow key={action.text} text={action.text} notes={action.sourceIds} label="Sources" />
        ))}
        <Fact label="Avoid" value={AVOID.join(", ")} />
        <div className="flex flex-wrap items-center gap-2">
          <Fact label="Proposed avoidance interval" value={`${AVOIDANCE_INTERVAL_HOURS.min}–${AVOIDANCE_INTERVAL_HOURS.max} hours`} />
          <StatusMark>{SUPPLIED_WORKFLOW_PARAMETER}</StatusMark>
        </div>
        <p className="text-sm leading-relaxed">{VOID_BEFORE_IMAGING}</p>
        <Fact label="Baseline observations" value={BASELINE_OBSERVATIONS.join(", ")} />
      </ProtocolStep>

      <ProtocolStep title={ASL_STEP_TITLES[1]} notes={PCASL_SOURCE_IDS} notesLabel="pCASL sources">
        <Lines items={RESTING_CONDITIONS} />
        {ANATOMICAL_SEQUENCES.map((sequence) => (
          <div key={sequence.name}>
            <p className="text-sm leading-relaxed break-words">{sequence.name}</p>
            <p className="text-sm leading-relaxed break-words text-slate-500 dark:text-muted-foreground">{sequence.purpose}</p>
          </div>
        ))}
        <p className="text-sm leading-relaxed break-words">{PCASL_SEQUENCE}</p>
        <Fact label="Example labeling duration" value={`${EXAMPLE_LABELING_DURATION_MS.min}–${EXAMPLE_LABELING_DURATION_MS.max} ms`} />
        <Fact label="Example single PLD" value={`${EXAMPLE_SINGLE_PLD_MS} ms`} />
        <p className="text-sm leading-relaxed break-words">{ACQUIRE_M0}</p>
        <p className="text-sm leading-relaxed break-words">{DELAYED_TRANSIT_STRATEGY}</p>
      </ProtocolStep>

      <ProtocolStep title={ASL_STEP_TITLES[2]}>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm">{DRUG_GENERIC_NAME}</p>
          <p className="text-sm">{DRUG_BRAND_EXAMPLE}</p>
          <p className="text-sm">{DRUG_ROUTE}</p>
          <StatusMark>{REQUIRES_LOCAL_VALIDATION}</StatusMark>
          <ProtocolInfoNote label="Dose evidence" notes={DOSE_NOTES} />
        </div>
        <Fact label="Adult" value={`${ADULT_DOSE_MG.min}–${ADULT_DOSE_MG.max} mg`} />
        <Fact label="Pediatric" value={`${PEDIATRIC_MG_PER_KG} mg/kg`} />
        <Fact label="Pediatric cap candidates" value={PEDIATRIC_CAP_CANDIDATES_MG.map((mg) => `${mg} mg`).join(", ")} />
        <NoteRow text={PREPARATION_METHOD} notes={[CRUSH_EVIDENCE_NOTE]} label="Preparation evidence" />
        <p className="text-sm leading-relaxed">{DO_NOT_CRUSH_EXTENDED_RELEASE}</p>
        <Fact label="Record" value={DOSE_RECORD.join(", ")} />
        <Fact label="Monitor" value={DOSE_MONITOR.join(", ")} />
        <p className="text-sm leading-relaxed break-words">{URGENT_ACTION}</p>
      </ProtocolStep>

      <ProtocolStep title={ASL_STEP_TITLES[3]} notes={TIMING_NOTES} notesLabel="Timing evidence">
        <div className="flex flex-wrap items-center gap-2">
          <StatusMark>{REQUIRES_LOCAL_VALIDATION}</StatusMark>
        </div>
        <Fact label="Single scan window" value={`${TIMING_WINDOW_MINUTES.min}–${TIMING_WINDOW_MINUTES.max} minutes after oral dose`} />
        <Fact label="Optional serial scan" value={`${SERIAL_SCAN_MINUTES.join(", ")} minutes after oral dose`} />
        <Lines items={POST_CHALLENGE_ACQUISITION} />
        <Fact label="Zero event" value={ZERO_EVENT} />
        <Fact label="Post-dose unit" value={POST_DOSE_UNIT} />
        <Fact label="Baseline acquisition" value={BASELINE_ACQUISITION} />
        <p className="text-sm leading-relaxed">{RECORD_SCAN_TIMES}</p>
      </ProtocolStep>

      <ProtocolStep title={ASL_STEP_TITLES[4]}>
        <Lines items={PROCESSING} />
        <div className="flex items-start gap-1">
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
            <NumericField
              label="Baseline CBF"
              unit={CBF_UNIT}
              value={preRaw}
              onChange={(value) => {
                setPreRaw(value);
                clearCopy();
              }}
            />
            <NumericField
              label="Post-challenge CBF"
              unit={CBF_UNIT}
              value={postRaw}
              onChange={(value) => {
                setPostRaw(value);
                clearCopy();
              }}
            />
          </div>
          <ProtocolInfoNote label="CVR calculation" notes={CALCULATION_NOTES} />
        </div>
        <ResultBlock lines={cvr == null ? [] : [`CVR: ${formatCvrPercent(cvr)}%`]} />
        <div className="flex items-start gap-1">
          <div className="min-w-0 flex-1 space-y-2">
            {REPORTABLE_PATTERNS.map((pattern) => (
              <div key={pattern.label}>
                <p className="text-sm font-medium leading-snug break-words">{pattern.label}</p>
                <p className="text-sm leading-relaxed break-words">{pattern.description}</p>
              </div>
            ))}
          </div>
          <ProtocolInfoNote label="Reference values" notes={INTERPRETATION_NOTES} />
        </div>
        <Lines items={REPORT_FIELDS} />
      </ProtocolStep>

      <ProtocolStep title={ASL_STEP_TITLES[5]} notes={RECOVERY_SOURCE_IDS} notesLabel="Post-procedure sources">
        <Lines items={RECOVERY_ACTIONS} />
      </ProtocolStep>

      <div className="space-y-3 py-3">
        <ReferenceList references={ASL_CVR_REFERENCES} />
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
