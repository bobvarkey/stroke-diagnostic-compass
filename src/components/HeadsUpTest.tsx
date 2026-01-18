import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  RotateCcw,
  Brain,
  Activity,
  Stethoscope,
  Info
} from "lucide-react";

interface NIHSSItem {
  id: string;
  name: string;
  baselineScore: number;
  currentScore: number;
}

const nihssItems: NIHSSItem[] = [
  { id: "1a", name: "1a. Level of Consciousness", baselineScore: 0, currentScore: 0 },
  { id: "1b", name: "1b. LOC Questions", baselineScore: 0, currentScore: 0 },
  { id: "1c", name: "1c. LOC Commands", baselineScore: 0, currentScore: 0 },
  { id: "2", name: "2. Best Gaze", baselineScore: 0, currentScore: 0 },
  { id: "3", name: "3. Visual Fields", baselineScore: 0, currentScore: 0 },
  { id: "4", name: "4. Facial Palsy", baselineScore: 0, currentScore: 0 },
  { id: "5a", name: "5a. Motor Arm - Left", baselineScore: 0, currentScore: 0 },
  { id: "5b", name: "5b. Motor Arm - Right", baselineScore: 0, currentScore: 0 },
  { id: "6a", name: "6a. Motor Leg - Left", baselineScore: 0, currentScore: 0 },
  { id: "6b", name: "6b. Motor Leg - Right", baselineScore: 0, currentScore: 0 },
  { id: "7", name: "7. Limb Ataxia", baselineScore: 0, currentScore: 0 },
  { id: "8", name: "8. Sensory", baselineScore: 0, currentScore: 0 },
  { id: "9", name: "9. Best Language", baselineScore: 0, currentScore: 0 },
  { id: "10", name: "10. Dysarthria", baselineScore: 0, currentScore: 0 },
  { id: "11", name: "11. Extinction/Inattention", baselineScore: 0, currentScore: 0 },
];

const HeadsUpTest: React.FC = () => {
  const [testStarted, setTestStarted] = useState(false);
  const [testPaused, setTestPaused] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testPositive, setTestPositive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [nihssScores, setNihssScores] = useState<NIHSSItem[]>(
    nihssItems.map(item => ({ ...item }))
  );
  const [baselineNihss, setBaselineNihss] = useState(0);
  const [currentNihss, setCurrentNihss] = useState(0);
  const [assessmentTimes, setAssessmentTimes] = useState<{ time: number; nihss: number }[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const TEST_DURATION = 30 * 60; // 30 minutes in seconds

  // Timer effect
  useEffect(() => {
    if (testStarted && !testPaused && !testCompleted && !testPositive) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          if (newTime >= TEST_DURATION) {
            setTestCompleted(true);
            if (timerRef.current) clearInterval(timerRef.current);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStarted, testPaused, testCompleted, testPositive]);

  // Calculate NIHSS totals
  useEffect(() => {
    const baseline = nihssScores.reduce((sum, item) => sum + item.baselineScore, 0);
    const current = nihssScores.reduce((sum, item) => sum + item.currentScore, 0);
    setBaselineNihss(baseline);
    setCurrentNihss(current);
  }, [nihssScores]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTest = () => {
    setTestStarted(true);
    setTestPaused(false);
    setTestCompleted(false);
    setTestPositive(false);
    setElapsedTime(0);
    setAssessmentTimes([{ time: 0, nihss: baselineNihss }]);
  };

  const pauseTest = () => {
    setTestPaused(!testPaused);
  };

  const resetTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTestStarted(false);
    setTestPaused(false);
    setTestCompleted(false);
    setTestPositive(false);
    setElapsedTime(0);
    setNihssScores(nihssItems.map(item => ({ ...item })));
    setAssessmentTimes([]);
  };

  const markPositive = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTestPositive(true);
    setTestCompleted(true);
  };

  const recordAssessment = () => {
    setAssessmentTimes(prev => [...prev, { time: elapsedTime, nihss: currentNihss }]);
  };

  const updateScore = (id: string, field: 'baselineScore' | 'currentScore', value: number) => {
    setNihssScores(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const nihssDelta = currentNihss - baselineNihss;
  const hasWorsening = nihssDelta > 0;
  const progressPercent = (elapsedTime / TEST_DURATION) * 100;

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <ArrowUp className="h-6 w-6" />
          Heads Up Test for LVO with Low NIHSS
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Decision support for mechanical thrombectomy in LVO patients with mild symptoms
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Clinical Context */}
        <Alert className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">Clinical Indication</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
            <p className="mb-2">
              <strong>Use when:</strong> Patient has confirmed LVO but presents with <strong>low NIHSS</strong> (typically ≤5) 
              after initial supine assessment, making MT decision uncertain.
            </p>
            <p>
              <strong>Purpose:</strong> Identify patients at risk of collateral vulnerability and functional deterioration 
              by elevating head-of-bed to 90° for up to 30 minutes.
            </p>
          </AlertDescription>
        </Alert>

        {/* Test Protocol */}
        <div className="bg-card border rounded-lg p-4">
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <Stethoscope className="h-4 w-4 text-primary" />
            Test Protocol (Ali et al., 2016)
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li><strong>Baseline NIHSS:</strong> Record NIHSS while patient is supine</li>
            <li><strong>Position:</strong> Elevate head-of-bed to 90 degrees</li>
            <li><strong>Duration:</strong> Maintain position for up to 30 minutes</li>
            <li><strong>Monitor:</strong> Continuously assess for any neurological worsening</li>
            <li><strong>Positive Test:</strong> ANY worsening → Terminate immediately → Proceed to catheterization</li>
            <li><strong>Negative Test:</strong> No worsening after 30 min → Consider conservative management</li>
          </ol>
        </div>

        {/* Timer and Controls */}
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Test Timer
            </h4>
            <Badge variant={testPositive ? "destructive" : testCompleted ? "default" : testStarted ? "secondary" : "outline"}>
              {testPositive ? "POSITIVE - STOP" : testCompleted ? "COMPLETED" : testStarted ? (testPaused ? "PAUSED" : "IN PROGRESS") : "NOT STARTED"}
            </Badge>
          </div>

          {/* Timer Display */}
          <div className="text-center py-4">
            <div className="text-5xl font-mono font-bold text-primary">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              of {formatTime(TEST_DURATION)} (30 minutes)
            </div>
            <Progress value={progressPercent} className="mt-3 h-2" />
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            {!testStarted ? (
              <Button onClick={startTest} className="gap-2" size="lg">
                <Play className="h-4 w-4" />
                Start Test
              </Button>
            ) : (
              <>
                <Button 
                  onClick={pauseTest} 
                  variant="outline" 
                  className="gap-2"
                  disabled={testCompleted || testPositive}
                >
                  {testPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {testPaused ? "Resume" : "Pause"}
                </Button>
                <Button 
                  onClick={markPositive} 
                  variant="destructive" 
                  className="gap-2"
                  disabled={testCompleted || testPositive}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Mark Positive (Worsening)
                </Button>
                <Button onClick={resetTest} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>

        {/* NIHSS Tracking */}
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              NIHSS Comparison
            </h4>
            <Button 
              onClick={recordAssessment} 
              size="sm" 
              variant="outline"
              disabled={!testStarted || testCompleted}
            >
              <Activity className="h-4 w-4 mr-1" />
              Record Assessment
            </Button>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {baselineNihss}
              </div>
              <div className="text-xs text-muted-foreground">Baseline (Supine)</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {currentNihss}
              </div>
              <div className="text-xs text-muted-foreground">Current (Upright)</div>
            </div>
            <div className={`rounded-lg p-3 ${
              hasWorsening 
                ? "bg-red-100 dark:bg-red-950/50" 
                : "bg-green-50 dark:bg-green-950/50"
            }`}>
              <div className={`text-2xl font-bold ${
                hasWorsening 
                  ? "text-red-700 dark:text-red-300" 
                  : "text-green-700 dark:text-green-300"
              }`}>
                {nihssDelta > 0 ? `+${nihssDelta}` : nihssDelta}
              </div>
              <div className="text-xs text-muted-foreground">Delta (Change)</div>
            </div>
          </div>

          {/* Worsening Alert */}
          {hasWorsening && (
            <Alert className="bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-300">Neurological Worsening Detected!</AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400">
                NIHSS increased by {nihssDelta} point(s). Consider terminating test and proceeding to catheterization.
              </AlertDescription>
            </Alert>
          )}

          {/* NIHSS Items Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">NIHSS Item</th>
                  <th className="text-center py-2 px-2 w-24">Baseline</th>
                  <th className="text-center py-2 px-2 w-24">Current</th>
                  <th className="text-center py-2 px-2 w-20">Δ</th>
                </tr>
              </thead>
              <tbody>
                {nihssScores.map((item) => {
                  const delta = item.currentScore - item.baselineScore;
                  return (
                    <tr key={item.id} className={`border-b ${delta > 0 ? "bg-red-50 dark:bg-red-950/30" : ""}`}>
                      <td className="py-2 pr-4 text-muted-foreground">{item.name}</td>
                      <td className="text-center py-2 px-2">
                        <select
                          value={item.baselineScore}
                          onChange={(e) => updateScore(item.id, 'baselineScore', parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border rounded text-center bg-background"
                          disabled={testStarted}
                        >
                          {[0, 1, 2, 3, 4].map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td className="text-center py-2 px-2">
                        <select
                          value={item.currentScore}
                          onChange={(e) => updateScore(item.id, 'currentScore', parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border rounded text-center bg-background"
                        >
                          {[0, 1, 2, 3, 4].map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td className={`text-center py-2 px-2 font-medium ${
                        delta > 0 ? "text-red-600 dark:text-red-400" : 
                        delta < 0 ? "text-green-600 dark:text-green-400" : ""
                      }`}>
                        {delta > 0 ? `+${delta}` : delta}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Assessment History */}
          {assessmentTimes.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Assessment Timeline</h5>
              <div className="flex flex-wrap gap-2">
                {assessmentTimes.map((assessment, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {formatTime(assessment.time)}: NIHSS {assessment.nihss}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Result Interpretation */}
        {(testCompleted || testPositive) && (
          <Alert className={testPositive || hasWorsening 
            ? "bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700"
            : "bg-green-50 dark:bg-green-950/50 border-green-300 dark:border-green-700"
          }>
            {testPositive || hasWorsening ? (
              <>
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-300 text-lg">
                  POSITIVE Heads Up Test
                </AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-400 space-y-2">
                  <p className="font-medium">
                    Neurological worsening detected → Collateral vulnerability present
                  </p>
                  <p>
                    <strong>Recommended Action:</strong> Terminate test immediately and proceed with catheterization 
                    for mechanical thrombectomy.
                  </p>
                </AlertDescription>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-300 text-lg">
                  NEGATIVE Heads Up Test
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400 space-y-2">
                  <p className="font-medium">
                    No neurological worsening after 30 minutes → Adequate collateral compensation
                  </p>
                  <p>
                    <strong>Interpretation:</strong> Patient may have adequate collateral circulation. 
                    Consider conservative management with close monitoring. Decision for MT should factor 
                    in additional clinical considerations.
                  </p>
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        {/* Evidence Citation */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <p className="font-medium mb-1">Reference:</p>
          <p>
            Ali LK, et al. (2016). "The Heads Up Test: A pilot study to assess patients with 
            large vessel occlusion stroke and mild symptoms." <em>J Stroke Cerebrovasc Dis.</em>
          </p>
          <p className="mt-2">
            <strong>Note:</strong> A positive Heads Up test suggests impending collateral vulnerability, 
            warranting immediate intervention. Clinical judgment should incorporate all available data 
            including imaging, time from onset, and patient factors.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeadsUpTest;
