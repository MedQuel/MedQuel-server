-- MedQuel — BigQuery Schema
-- Region: asia-south1 (matches Firestore)

-- questions — master question bank
CREATE TABLE IF NOT EXISTS medquel_production.questions (
  question_id     STRING    NOT NULL OPTIONS(description="UUID, primary key. Assigned during ingestion — never supplied by the content team."),
  question_text   STRING    NOT NULL,
  option_a        STRING    NOT NULL,
  option_b        STRING    NOT NULL,
  option_c        STRING    NOT NULL,
  option_d        STRING    NOT NULL,
  correct_answer  STRING    NOT NULL OPTIONS(description="'A'|'B'|'C'|'D'"),
  explanation     STRING,

  subject         STRING    NOT NULL,
  topic           STRING    NOT NULL,
  subtopic        STRING,
  difficulty      STRING    NOT NULL,                -- 'easy' | 'medium' | 'hard'
  question_type   STRING    DEFAULT "mcq" NOT NULL,  -- 'mcq' | 'assertion_reason' | 'match' | 'image_based' | 'clinical'
  image_url       STRING,                            -- required only when question_type = 'image_based'
  marks           INT64     DEFAULT 4     NOT NULL,

  target_exams    ARRAY<STRING>,
  tags            ARRAY<STRING>,

  is_premium      BOOL      DEFAULT FALSE NOT NULL,
  is_active       BOOL      DEFAULT TRUE  NOT NULL,
  source_module   STRING    OPTIONS(description="Derived from the uploaded filename, e.g. 'Surgery_PYT_Module_1'."),
  content_hash    STRING    NOT NULL OPTIONS(description="SHA-256 of question_text."),

  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP() NOT NULL,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP() NOT NULL,
  reviewed_by     STRING,                            -- admin userId, set later via Admin CMS

  PRIMARY KEY (question_id) NOT ENFORCED
)
CLUSTER BY subject, difficulty, is_active
OPTIONS (description = "Master question bank, populated by ingestQuestions Cloud Function.");


-- quiz_attempts_raw — write-only log, append-only by design
CREATE TABLE IF NOT EXISTS medquel_production.quiz_attempts_raw (
  attempt_id       STRING    NOT NULL,               -- UUID
  session_id       STRING    NOT NULL,               -- ref to Firestore quizSessions/{id}
  user_id          STRING    NOT NULL,               -- ref to Firestore users/{uid}
  question_id      STRING    NOT NULL,               -- ref to questions.question_id
  selected_option  STRING    NOT NULL,               -- 'A' | 'B' | 'C' | 'D' | 'SKIPPED'
  is_correct       BOOL      NOT NULL,
  time_spent_secs  INT64     NOT NULL,
  subject          STRING    NOT NULL,
  difficulty       STRING    NOT NULL,
  attempted_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP() NOT NULL,

  PRIMARY KEY (attempt_id) NOT ENFORCED,
  FOREIGN KEY (question_id) REFERENCES medquel_production.questions(question_id) NOT ENFORCED
)
PARTITION BY DATE(attempted_at)
CLUSTER BY subject, difficulty
OPTIONS (description = "Write-only quiz attempt log, streamed via Pub/Sub after every quiz submission.");
