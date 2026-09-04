--
-- PostgreSQL database dump
--

\restrict q56bMB8rs6vbKDjaLz0bFm0oiDbNfhGCB1qbGmrdKOwUPSK6yauIYrggz8hiTyK

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: email_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.email_status_enum AS ENUM (
    'draft',
    'sent',
    'failed'
);


ALTER TYPE public.email_status_enum OWNER TO postgres;

--
-- Name: task_priority_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_priority_enum AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.task_priority_enum OWNER TO postgres;

--
-- Name: task_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.task_status_enum AS ENUM (
    'pending',
    'in_progress',
    'done',
    'waiting_approval',
    'blocked',
    'completed',
    'cancelled'
);


ALTER TYPE public.task_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: document_exports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_exports (
    id integer NOT NULL,
    user_id integer NOT NULL,
    doc_type character varying(50),
    export_format character varying(10),
    file_path character varying(500),
    created_at timestamp without time zone
);


ALTER TABLE public.document_exports OWNER TO postgres;

--
-- Name: document_exports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.document_exports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_exports_id_seq OWNER TO postgres;

--
-- Name: document_exports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.document_exports_id_seq OWNED BY public.document_exports.id;


--
-- Name: email_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    subject character varying(300),
    recipient character varying(200),
    recipient_email character varying(255),
    designation character varying(200),
    tone character varying(50),
    context text,
    generated_email text,
    batch_id character varying(100),
    status public.email_status_enum,
    sent_time timestamp without time zone,
    error_message text,
    created_at timestamp without time zone
);


ALTER TABLE public.email_history OWNER TO postgres;

--
-- Name: email_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_history_id_seq OWNER TO postgres;

--
-- Name: email_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_history_id_seq OWNED BY public.email_history.id;


--
-- Name: meeting_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meeting_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    meeting_title character varying(300),
    attendees text,
    raw_notes text,
    generated_mom text,
    created_at timestamp without time zone
);


ALTER TABLE public.meeting_history OWNER TO postgres;

--
-- Name: meeting_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meeting_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meeting_history_id_seq OWNER TO postgres;

--
-- Name: meeting_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meeting_history_id_seq OWNED BY public.meeting_history.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: report_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    date character varying(20),
    team_name character varying(200),
    tasks_completed text,
    blockers text,
    generated_report text,
    created_at timestamp without time zone
);


ALTER TABLE public.report_history OWNER TO postgres;

--
-- Name: report_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.report_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.report_history_id_seq OWNER TO postgres;

--
-- Name: report_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_history_id_seq OWNED BY public.report_history.id;


--
-- Name: task_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_attachments (
    id integer NOT NULL,
    task_id integer NOT NULL,
    user_id integer NOT NULL,
    filename character varying(255) NOT NULL,
    stored_filename character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    content_type character varying(120),
    size_bytes integer,
    created_at timestamp without time zone
);


ALTER TABLE public.task_attachments OWNER TO postgres;

--
-- Name: task_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_attachments_id_seq OWNER TO postgres;

--
-- Name: task_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_attachments_id_seq OWNED BY public.task_attachments.id;


--
-- Name: task_checklist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_checklist_items (
    id integer NOT NULL,
    task_id integer,
    title character varying(300) NOT NULL,
    is_completed integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone,
    parent_checklist_id integer
);


ALTER TABLE public.task_checklist_items OWNER TO postgres;

--
-- Name: task_checklist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_checklist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_checklist_items_id_seq OWNER TO postgres;

--
-- Name: task_checklist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_checklist_items_id_seq OWNED BY public.task_checklist_items.id;


--
-- Name: task_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_comments (
    id integer NOT NULL,
    task_id integer NOT NULL,
    user_id integer NOT NULL,
    author_name character varying(200),
    comment text NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.task_comments OWNER TO postgres;

--
-- Name: task_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_comments_id_seq OWNER TO postgres;

--
-- Name: task_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_comments_id_seq OWNED BY public.task_comments.id;


--
-- Name: task_external_updates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_external_updates (
    id integer NOT NULL,
    task_id integer,
    updater_name character varying(200),
    updater_email character varying(255),
    progress integer DEFAULT 0,
    comment text,
    proof_file_path character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    proof_filename character varying(255),
    proof_content_type character varying(120)
);


ALTER TABLE public.task_external_updates OWNER TO postgres;

--
-- Name: task_external_updates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_external_updates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_external_updates_id_seq OWNER TO postgres;

--
-- Name: task_external_updates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_external_updates_id_seq OWNED BY public.task_external_updates.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(300) NOT NULL,
    description text,
    assigned_to character varying(200),
    priority character varying(20),
    status character varying(40),
    due_date character varying(20),
    reminder_message text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    parent_task_id integer,
    source_type character varying(50),
    source_id integer,
    progress integer DEFAULT 0,
    estimated_effort character varying(100),
    recurrence character varying(40) DEFAULT 'none'::character varying,
    recurrence_anchor character varying(20),
    assignees text,
    assignee_emails text,
    public_update_token character varying(255),
    professional_description text,
    email_subject character varying(300),
    task_pdf_path character varying(500),
    task_docx_path character varying(500),
    email_sent_at timestamp without time zone,
    email_error text
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: user_smtp_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_smtp_settings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    provider character varying(50),
    smtp_host character varying(200) NOT NULL,
    smtp_port integer NOT NULL,
    smtp_email character varying(255) NOT NULL,
    encrypted_app_password text NOT NULL,
    from_name character varying(200),
    is_active integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.user_smtp_settings OWNER TO postgres;

--
-- Name: user_smtp_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_smtp_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_smtp_settings_id_seq OWNER TO postgres;

--
-- Name: user_smtp_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_smtp_settings_id_seq OWNED BY public.user_smtp_settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(200) NOT NULL,
    full_name character varying(200),
    designation character varying(200),
    hashed_password character varying(255) NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: document_exports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_exports ALTER COLUMN id SET DEFAULT nextval('public.document_exports_id_seq'::regclass);


--
-- Name: email_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_history ALTER COLUMN id SET DEFAULT nextval('public.email_history_id_seq'::regclass);


--
-- Name: meeting_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_history ALTER COLUMN id SET DEFAULT nextval('public.meeting_history_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: report_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_history ALTER COLUMN id SET DEFAULT nextval('public.report_history_id_seq'::regclass);


--
-- Name: task_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_attachments ALTER COLUMN id SET DEFAULT nextval('public.task_attachments_id_seq'::regclass);


--
-- Name: task_checklist_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_checklist_items ALTER COLUMN id SET DEFAULT nextval('public.task_checklist_items_id_seq'::regclass);


--
-- Name: task_comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments ALTER COLUMN id SET DEFAULT nextval('public.task_comments_id_seq'::regclass);


--
-- Name: task_external_updates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_external_updates ALTER COLUMN id SET DEFAULT nextval('public.task_external_updates_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: user_smtp_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_smtp_settings ALTER COLUMN id SET DEFAULT nextval('public.user_smtp_settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: document_exports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_exports (id, user_id, doc_type, export_format, file_path, created_at) FROM stdin;
1	1	report	pdf	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\reports\\Daily Report - Adam HADDAD_OP_260226_006 - 2026-06-05.pdf	2026-06-05 07:06:30.810598
2	1	report	pdf	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\reports\\Daily Report - Backend Engineering - 2026-06-05.pdf	2026-06-05 07:19:27.641769
3	1	report	docx	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\reports\\Daily Report - Backend Engineering - 2026-06-05.docx	2026-06-05 07:25:20.124156
4	1	report	pdf	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\reports\\Daily Report - Backend Engineering - 2026-06-05_1.pdf	2026-06-05 07:25:39.408225
5	1	report	pdf	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\exports\\Daily Report - Backend Engineering - 2026-06-05.pdf	2026-06-05 08:02:03.268465
6	1	report	docx	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\exports\\Daily Report - Adam HADDAD_OP_260226_006 - 2026-06-05.docx	2026-06-05 08:03:17.380196
7	1	report	pdf	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\exports\\Daily Report - Backend Engineering - 2026-06-05_1.pdf	2026-06-05 08:06:13.046591
8	1	report	docx	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\exports\\Daily Report - Backend Engineering - 2026-06-05.docx	2026-06-05 08:06:21.988819
9	1	meeting	docx	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\moms\\MOM - Q4 Sprint Planning_3.docx	2026-06-08 10:08:30.078666
10	1	meeting	pdf	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\moms\\MOM - Q4 Sprint Planning_3.pdf	2026-06-08 10:08:44.451152
11	1	meeting	pdf	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\moms\\MOM - Q4 Sprint Planning_4.pdf	2026-06-08 10:58:29.946018
12	1	meeting	docx	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\moms\\MOM - Q4 Sprint Planning_4.docx	2026-06-08 10:58:30.829705
13	1	task	docx	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\Task - Deploy in AWS.docx	2026-06-09 08:17:52.494442
14	1	task	pdf	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\Task - Deploy in AWS.pdf	2026-06-09 08:18:00.169416
15	1	task	docx	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\Task - Deploy in AWS_1.docx	2026-06-09 10:53:31.986029
16	1	task	docx	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\Task - Develop Backend.docx	2026-06-10 04:45:06.555665
17	1	meeting	pdf	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\moms\\MOM - Q4 Sprint Planning_5.pdf	2026-06-11 05:02:47.203606
\.


--
-- Data for Name: email_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_history (id, user_id, subject, recipient, recipient_email, designation, tone, context, generated_email, batch_id, status, sent_time, error_message, created_at) FROM stdin;
1	1	Project Status Update	Ankita, Trainee	ankita.banerjee2206@gmail.com	\N	formal	Give me project update	Dear Ankita, Trainee,\nI am writing to provide you with the current status of our ongoing project. As per our previous discussions, we have completed the initial phases, including data collection and analysis. The team is currently working on the implementation stage, and we are on track to meet the deadline. However, there are a few areas that require attention, and I would like to schedule a meeting with you to discuss the details and outline the next steps. Please let me know your availability, and I will coordinate a meeting at your earliest convenience.\n\nBest regards,\nAbhijit Das\nTrainee	\N	sent	2026-06-05 06:33:21.386417	\N	2026-06-05 06:33:15.32627
\.


--
-- Data for Name: meeting_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meeting_history (id, user_id, meeting_title, attendees, raw_notes, generated_mom, created_at) FROM stdin;
1	1	Q4 Sprint Planning	Sayeli (PM), Monojit (Lead Dev), Carol (QA), Abhijit (DevOps)	- discuss q4 roadmap\n- cost cutting process	MINUTES OF MEETING\n\nMeeting Title:\nQ4 Sprint Planning\n\nAttendees:\nSayeli (PM), Monojit (Lead Dev), Carol (QA), Abhijit (DevOps)\n\nDiscussion Summary:\nThe meeting commenced with a review of the Q4 roadmap, where the team discussed the key objectives and deliverables for the quarter. The team also delved into the cost-cutting process, exploring areas where expenses could be optimized without compromising the quality of deliverables. Key discussion points included the prioritization of tasks, resource allocation, and potential areas for cost reduction.\n\nDecisions Taken:\n1. The team decided to prioritize the development of the new feature, as it is expected to generate significant revenue in the upcoming quarter.\n2. The cost-cutting process will be implemented in phases, with the first phase focusing on reducing non-essential expenses and the second phase exploring more strategic cost-saving measures.\n\nAction Items:\n1. Review and finalize the Q4 roadmap - Sayeli (PM) - End of the week\n2. Conduct a thorough analysis of the current expenses and identify areas for cost reduction - Abhijit (DevOps) - Within two weeks\n3. Develop a comprehensive plan for the implementation of the cost-cutting process - Monojit (Lead Dev) and Carol (QA) - Within three weeks\n\nClosing Notes:\nThe meeting concluded with a clear understanding of the Q4 objectives and the cost-cutting strategy. The team is committed to working together to achieve the set goals and ensure a successful quarter. The next meeting will be scheduled to review the progress and discuss any challenges or concerns that may arise during the implementation of the plans.	2026-06-08 10:07:59.456417
2	1	Q4 Sprint Planning	Sayeli (PM), Monojit (Lead Dev), Carol (QA), Abhijit (DevOps)	- discuss about profit	# Minutes of Meeting\n\n## Meeting Title\nQ4 Sprint Planning\n\n## Attendees\nSayeli (PM), Monojit (Lead Dev), Carol (QA), Abhijit (DevOps)\n\n## Meeting Summary\nMINUTES OF MEETING\n\nMeeting Title:\nQ4 Sprint Planning\n\nMeeting Objective:\nThe objective of this meeting was to discuss the profit aspects of the Q4 sprint planning, focusing on key areas that can drive business growth and revenue. The discussion aimed to identify opportunities for improvement and alignment with the company's overall goals. The meeting also sought to establish a clear understanding of the team's objectives and priorities for the upcoming quarter.\n\nAttendees:\nSayeli (PM), Monojit (Lead Dev), Carol (QA), Abhijit (DevOps)\n\nMeeting Overview:\nThe meeting commenced with an introduction to the Q4 sprint planning, highlighting the importance of aligning the team's efforts with the company's profit-driven objectives. The team engaged in a discussion on the key aspects that can impact profit, including revenue growth, cost optimization, and resource allocation. The conversation also touched upon the need for effective collaboration and communication among team members to ensure successful execution of the sprint plan.\n\nKey Discussion Points:\n1. The team discussed the importance of identifying and prioritizing high-revenue generating tasks and activities to maximize profit.\n2. The need for efficient resource allocation and utilization was emphasized to minimize costs and optimize returns.\n3. The team also explored opportunities for cost reduction and process improvements to enhance overall profitability.\n4. The discussion highlighted the significance of regular progress monitoring and review to ensure the team stays on track with its objectives.\n\nDecisions Taken:\n1. The team decided to prioritize tasks and activities that have a direct impact on revenue growth and profit generation, ensuring alignment with the company's overall business objectives.\n2. It was decided that the team would conduct regular review sessions to monitor progress, identify areas for improvement, and make adjustments as necessary to stay on track with the sprint plan.\n\nAction Items:\n1. Task: Develop a detailed sprint plan outlining key tasks, activities, and timelines.\n   Owner: Sayeli (PM)\n   Deadline: To be confirmed\n   Priority: High\n2. Task: Conduct a thorough review of the current resource allocation and identify opportunities for optimization.\n   Owner: Monojit (Lead Dev)\n   Deadline: To be confirmed\n   Priority: Medium\n\nRisks / Dependencies:\n1. No major risks or dependencies were identified.\n\nNext Steps:\n1. The team will convene for a follow-up meeting to review the detailed sprint plan and provide feedback.\n2. The team will establish a regular review and progress monitoring schedule to ensure the sprint plan stays on track.\n3. The team will track and report on key performance indicators to measure progress and identify areas for improvement.\n\nClosing Summary:\nIn conclusion, the Q4 sprint planning meeting successfully aligned the team's objectives with the company's profit-driven goals, establishing a clear understanding of priorities and tasks. The team has taken ownership of key action items, with designated owners and deadlines to be confirmed. The next steps will focus on reviewing and refining the sprint plan, monitoring progress, and making adjustments as necessary to ensure successful execution and achievement of the team's objectives.\n	2026-06-08 10:56:10.170853
3	1	Client interaction meeting	Abhijit Das, Sayeli, Sandip	Discuss about project, how develop, requirements etc.	# Minutes of Meeting\n\n## Meeting Title\nClient interaction meeting\n\n## Attendees\nAbhijit Das, Sayeli, Sandip\n\n## Meeting Summary\nMINUTES OF MEETING\n\nMeeting Title:\nClient interaction meeting\n\nMeeting Objective:\nThe objective of this meeting was to discuss the project development, requirements, and overall approach to ensure successful project execution. The meeting aimed to clarify expectations and align the team on the project's key aspects. The discussion focused on understanding client needs and developing a tailored approach.\n\nAttendees:\nAbhijit Das, Sayeli, Sandip\n\nMeeting Overview:\nThe meeting provided a platform for the team to engage in a comprehensive discussion about the project, focusing on development strategies and client requirements. The attendees shared their insights and expertise to ensure a thorough understanding of the project's scope. The conversation centered around identifying key project elements and outlining a general framework for moving forward. The team's collaborative approach facilitated a productive exchange of ideas.\n\nKey Discussion Points:\n1. The team discussed the project's development process, highlighting the importance of understanding client needs and expectations.\n2. The conversation touched on the project's requirements, emphasizing the need for a detailed analysis to inform the development approach.\n3. The attendees explored various development strategies, considering the project's unique aspects and potential challenges.\n\nDecisions Taken:\n1. The team decided to conduct a thorough analysis of the project's requirements to inform the development approach, which will have a significant impact on the project's overall success.\n2. The attendees agreed to develop a tailored project plan, taking into account the client's specific needs and expectations, which will be crucial in ensuring client satisfaction.\n\nAction Items:\n1. Task: Conduct a detailed analysis of the project's requirements.\n   Owner: Owner to be assigned.\n   Deadline: To be confirmed.\n   Priority: High.\n2. Task: Develop a tailored project plan.\n   Owner: Owner to be assigned.\n   Deadline: To be confirmed.\n   Priority: Medium.\n\nRisks / Dependencies:\n1. No major risks or dependencies were identified.\n\nNext Steps:\n1. The team will conduct a thorough analysis of the project's requirements to inform the development approach.\n2. The attendees will develop a tailored project plan, taking into account the client's specific needs and expectations.\n3. The team will review and track the project's progress, ensuring that the development approach aligns with the client's expectations.\n\nClosing Summary:\nIn conclusion, the client interaction meeting provided a valuable opportunity for the team to discuss the project's key aspects and align on the development approach. The attendees demonstrated a clear understanding of the project's requirements and expectations, and the decisions taken will have a positive impact on the project's success. The action items outlined will be tracked and reviewed to ensure timely completion, and the team will maintain open communication to address any emerging issues or concerns.\n	2026-06-11 05:29:42.863029
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: report_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.report_history (id, user_id, date, team_name, tasks_completed, blockers, generated_report, created_at) FROM stdin;
1	1	2026-06-05	Adam HADDAD_OP_260226_006	- build backend using fastapi\n- build frontend using react and vite	- deployment failed in render\n- problem to deploy database in mysql	**Daily Progress Report**\n**Date:** 2026-06-05\n**Team:** Adam HADDAD_OP_260226_006\n\n**Summary:**\nToday, the team made significant progress on the development of our project. We successfully built the backend using FastAPI and the frontend using React and Vite. However, we encountered some blockers that hindered our deployment process.\n\n**Tasks Completed:**\n\n1. **Backend Development:** We completed building the backend using FastAPI, which will serve as the foundation for our application's server-side logic.\n2. **Frontend Development:** We also finished building the frontend using React and Vite, which will provide a seamless user experience for our application.\n\n**Blockers:**\n\n1. **Deployment Failure in Render:** Unfortunately, our deployment to Render failed, which is currently preventing us from making our application available to users. We are investigating the issue and working on a resolution.\n2. **Database Deployment Issue in MySQL:** We are also experiencing difficulties deploying our database in MySQL, which is a critical component of our application. Our team is troubleshooting the problem and exploring alternative solutions.\n\n**Next Steps:**\nTo overcome the current blockers, we will focus on the following tasks tomorrow:\n\n1. **Troubleshoot Deployment Issue:** We will investigate the deployment failure in Render and work on resolving the issue to ensure a smooth deployment process.\n2. **Resolve Database Deployment Problem:** We will continue to troubleshoot the database deployment issue in MySQL and explore alternative solutions to ensure our database is properly set up and functional.\n\n**Conclusion:**\nDespite the blockers, the team made significant progress on the development of our project. We are committed to resolving the current issues and will work diligently to ensure the successful deployment of our application.	2026-06-05 07:06:22.113816
2	1	2026-06-05	Backend Engineering	- make it using fastapi\n- use langrap\n- make a custom ai agent	- deploy failed in render\n- sql is not compatible 	DAILY PROGRESS REPORT\n\nDate: 2026-06-05\nTeam: Backend Engineering\n\nExecutive Summary:\nToday, the Backend Engineering team made significant progress in developing key components of the project, including the implementation of a FastAPI framework, integration with Langrap, and creation of a custom AI agent. These advancements will contribute to the project's overall functionality and efficiency. The team's efforts have laid a solid foundation for further development and refinement.\n\nTasks Completed:\n1. Developed a core application using FastAPI to enable rapid and efficient API development.\n2. Successfully integrated Langrap into the project to leverage its capabilities.\n3. Designed and implemented a custom AI agent to enhance the project's intelligent features.\n\nChallenges Faced:\n1. The deployment process encountered an issue in Render, which resulted in a failed deployment.\n2. Compatibility problems were identified with the SQL component, requiring further investigation and resolution.\n\nNext Action Plan:\n1. Investigate and resolve the deployment issue in Render to ensure successful deployment.\n2. Address the SQL compatibility problem to ensure seamless integration with the project's database.\n3. Continue refining and testing the custom AI agent to optimize its performance.\n\nOverall Status:\nThe project is progressing, with the team addressing the identified challenges to ensure timely completion and delivery of a high-quality outcome.	2026-06-05 07:19:21.642565
3	1	2026-06-11	Deploy Trave Agent	deploy in render and neondb	connect backend with frontend	DAILY PROGRESS REPORT\n\nDate:\n2026-06-11\n\nTeam / Project:\nDeploy Trave Agent\n\nExecutive Summary:\nToday, the team made significant progress on the Deploy Trave Agent project, successfully completing key deployment tasks. The team deployed the application in render and neondb, marking a major milestone in the project timeline. Despite this progress, some challenges remain to be addressed.\n\nTasks Completed:\n1. Deployment of the application in render was successfully completed.\n2. Deployment of the application in neondb was also completed as planned.\n\nChallenges Faced:\n1. Connecting the backend with the frontend remains a significant challenge that needs to be resolved to move the project forward.\n\nNext Action Plan:\n1. Focus on resolving the backend and frontend connectivity issue to ensure seamless integration.\n2. Conduct thorough testing of the deployed application to identify and address any potential bugs or issues.\n3. Collaborate with the development team to implement a solution for the connectivity challenge.\n\nOverall Status:\nThe project is progressing, but the team needs to overcome the current challenges to stay on track and meet the project deadlines.	2026-06-11 03:42:03.636709
\.


--
-- Data for Name: task_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_attachments (id, task_id, user_id, filename, stored_filename, file_path, content_type, size_bytes, created_at) FROM stdin;
\.


--
-- Data for Name: task_checklist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_checklist_items (id, task_id, title, is_completed, created_at, updated_at, parent_checklist_id) FROM stdin;
1	7	Create and configure AWS EC2 instances for the application	1	2026-06-09 10:55:00.971427	2026-06-09 10:56:44.224344	\N
2	7	Set up and secure AWS RDS for database services	0	2026-06-09 10:55:00.971427	2026-06-09 10:56:44.225346	\N
3	7	Configure AWS S3 for storage and static content delivery	0	2026-06-09 10:55:00.971427	2026-06-09 10:56:44.22739	\N
4	7	Implement AWS Lambda for serverless computing needs	1	2026-06-09 10:55:00.971427	2026-06-09 10:56:44.228401	\N
5	7	Test and validate the deployment for security, performance, and functionality	1	2026-06-09 10:55:00.971427	2026-06-09 10:56:44.229832	\N
6	18	Design and implement the backend architecture using FastAPI	1	2026-06-09 11:06:44.51829	2026-06-09 11:07:27.940218	\N
7	18	Develop API endpoints for data exchange between frontend and backend	0	2026-06-09 11:06:44.51829	2026-06-09 11:07:27.941219	\N
8	18	Implement authentication and authorization mechanisms for secure data access	1	2026-06-09 11:06:44.51829	2026-06-09 11:07:27.942758	\N
9	18	Conduct thorough testing and debugging to ensure the backend is stable and functional	0	2026-06-09 11:06:44.51829	2026-06-09 11:07:27.944668	\N
10	18	Document the backend API and provide clear instructions for future maintenance and updates	0	2026-06-09 11:06:44.51829	2026-06-09 11:07:27.945756	\N
14	7	Review database schema requirement	0	2026-06-10 08:18:04.01454	2026-06-10 08:18:04.01454	2
17	7	Check production environment variables	0	2026-06-10 08:18:04.01454	2026-06-10 08:18:04.01454	3
19	7	Test full production workflow	0	2026-06-10 08:18:04.01454	2026-06-10 08:18:04.01454	3
20	7	Create or update required API endpoint	0	2026-06-10 08:18:04.01454	2026-06-10 08:18:04.01454	4
21	7	Connect API with schema and database logic	0	2026-06-10 08:18:04.01454	2026-06-10 08:18:04.01454	4
22	7	Test API response and error handling	0	2026-06-10 08:18:04.01454	2026-06-10 08:18:04.01454	4
23	7	Check production environment variables	0	2026-06-10 08:18:04.01454	2026-06-10 08:18:04.01454	5
24	7	Deploy and verify service health	0	2026-06-10 08:18:04.01454	2026-06-10 08:18:04.01454	5
25	7	Test full production workflow	0	2026-06-10 08:18:04.01454	2026-06-10 08:18:04.01454	5
11	7	Check production environment variables	1	2026-06-10 08:18:04.01454	2026-06-10 08:18:18.164572	1
18	7	Deploy and verify service health	1	2026-06-10 08:18:04.01454	2026-06-10 08:18:20.725539	3
12	7	Deploy and verify service health	1	2026-06-10 08:18:04.01454	2026-06-10 08:29:59.496845	1
13	7	Test full production workflow	1	2026-06-10 08:18:04.01454	2026-06-10 08:30:02.112103	1
16	7	Test database operation and validation	1	2026-06-10 08:18:04.01454	2026-06-10 08:30:08.593011	2
15	7	Update database model or table structure	1	2026-06-10 08:18:04.01454	2026-06-10 08:30:10.463837	2
26	18	Create or update required API endpoint	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	6
27	18	Connect API with schema and database logic	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	6
28	18	Test API response and error handling	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	6
29	18	Create or update required API endpoint	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	7
30	18	Connect API with schema and database logic	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	7
31	18	Test API response and error handling	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	7
32	18	Create or update required API endpoint	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	8
33	18	Connect API with schema and database logic	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	8
34	18	Test API response and error handling	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	8
35	18	Create or update required API endpoint	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	9
36	18	Connect API with schema and database logic	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	9
37	18	Test API response and error handling	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	9
38	18	Create or update required API endpoint	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	10
39	18	Connect API with schema and database logic	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	10
40	18	Test API response and error handling	0	2026-06-10 08:40:49.263709	2026-06-10 08:40:49.263709	10
91	31	Create a new Figma project and set up the design file structure	0	2026-06-10 10:24:19.267229	2026-06-10 10:24:19.267229	\N
92	31	Develop a consistent design concept and visual identity	0	2026-06-10 10:24:19.267229	2026-06-10 10:24:19.267229	\N
93	31	Design all necessary UI components, including layouts, buttons, and typography	0	2026-06-10 10:24:19.267229	2026-06-10 10:24:19.267229	\N
94	31	Test and iterate on the design to ensure usability and responsiveness	0	2026-06-10 10:24:19.267229	2026-06-10 10:24:19.267229	\N
95	31	Export and deliver the final design files in the required format	0	2026-06-10 10:24:19.267229	2026-06-10 10:24:19.267229	\N
96	31	Check mobile and desktop layout	0	2026-06-10 10:24:25.110964	2026-06-10 10:24:25.110964	93
97	31	Fix spacing and alignment issues	0	2026-06-10 10:24:25.110964	2026-06-10 10:24:25.110964	93
98	31	Check mobile and desktop layout	0	2026-06-10 10:24:25.110964	2026-06-10 10:24:25.110964	94
99	31	Fix spacing and alignment issues	0	2026-06-10 10:24:25.110964	2026-06-10 10:24:25.110964	94
\.


--
-- Data for Name: task_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_comments (id, task_id, user_id, author_name, comment, created_at) FROM stdin;
\.


--
-- Data for Name: task_external_updates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_external_updates (id, task_id, updater_name, updater_email, progress, comment, proof_file_path, created_at, proof_filename, proof_content_type) FROM stdin;
1	7	Abhijit Das	abhijit520das@gmail.com	60		\N	2026-06-09 10:56:44.243223	\N	\N
2	18		\N	40		\N	2026-06-09 11:07:27.953273	\N	\N
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, user_id, title, description, assigned_to, priority, status, due_date, reminder_message, created_at, updated_at, parent_task_id, source_type, source_id, progress, estimated_effort, recurrence, recurrence_anchor, assignees, assignee_emails, public_update_token, professional_description, email_subject, task_pdf_path, task_docx_path, email_sent_at, email_error) FROM stdin;
8	1	Check environment variables	Subtask for: Deploy in AWS	Abhijit Das	high	pending	2026-06-25	Task Reminder: Environment Variables Check\nAbhijit Das is assigned to check the environment variables by June 25, 2026. This task has been designated as high priority. Please ensure timely completion to meet project requirements. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-09 10:55:20.308003	2026-06-09 10:55:20.308003	7	\N	\N	0	\N	none	\N	["Abhijit Das"]	["abhijit520das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
9	1	Prepare production database	Subtask for: Deploy in AWS	Abhijit Das	high	pending	2026-06-25	Task Reminder: Production Database Preparation\nAbhijit Das is assigned to prepare the production database by 2026-06-25. This task has been designated as high priority. Please ensure timely completion to meet the deadline. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-09 10:55:20.308003	2026-06-09 10:55:20.308003	7	\N	\N	0	\N	none	\N	["Abhijit Das"]	["abhijit520das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
10	1	Deploy backend service	Subtask for: Deploy in AWS	Abhijit Das	high	pending	2026-06-25	Task Reminder: Deployment of Backend Service\nAbhijit Das is assigned to deploy the backend service by 2026-06-25. This task has been designated as high priority. Please ensure timely completion to meet project requirements. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-09 10:55:20.308003	2026-06-09 10:55:20.308003	7	\N	\N	0	\N	none	\N	["Abhijit Das"]	["abhijit520das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
11	1	Deploy frontend application	Subtask for: Deploy in AWS	Abhijit Das	high	pending	2026-06-25	Task Reminder: Deployment of Frontend Application\nAbhijit Das is assigned to deploy the frontend application by 2026-06-25. This task has been designated as high priority. Please ensure timely completion to meet project deadlines. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-09 10:55:20.308003	2026-06-09 10:55:20.308003	7	\N	\N	0	\N	none	\N	["Abhijit Das"]	["abhijit520das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
12	1	Test production workflow	Subtask for: Deploy in AWS	Abhijit Das	high	pending	2026-06-25	Task Reminder: Production Workflow Testing\nAbhijit Das is assigned to test the production workflow, with a due date of June 25, 2026. This task has been designated as high priority. Please ensure timely completion to meet project requirements. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-09 10:55:20.308003	2026-06-09 10:55:20.308003	7	\N	\N	0	\N	none	\N	["Abhijit Das"]	["abhijit520das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
13	1	Check environment variables	Subtask for: Deploy in AWS	Abhijit Das	high	pending	2026-06-25	Task Reminder: Environment Variables Check\nAbhijit Das is assigned to check environment variables by 2026-06-25. This task has a high priority and requires prompt attention to ensure timely completion. Please review and verify the environment variables as soon as possible.	2026-06-09 10:55:22.703677	2026-06-09 10:55:22.703677	7	\N	\N	0	\N	none	\N	["Abhijit Das"]	["abhijit520das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
14	1	Prepare production database	Subtask for: Deploy in AWS	Abhijit Das	high	pending	2026-06-25	Task Reminder: Production Database Preparation\nAbhijit Das is assigned to prepare the production database, with a due date of June 25, 2026, and a high priority. Please ensure timely completion of this task to meet project requirements. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-09 10:55:22.703677	2026-06-09 10:55:22.703677	7	\N	\N	0	\N	none	\N	["Abhijit Das"]	["abhijit520das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
15	1	Deploy backend service	Subtask for: Deploy in AWS	Abhijit Das	high	pending	2026-06-25	Task Reminder: Deployment of Backend Service\n\nDear Abhijit Das, \n\nThis is a polite reminder that the deployment of the backend service is due on 2026-06-25 and has been assigned a high priority. Please ensure timely completion of this task to meet the scheduled deadline. \n\nIf you require any assistance or have concerns, please do not hesitate to reach out. \n\nBest regards,\nOperations Team	2026-06-09 10:55:22.703677	2026-06-09 10:55:22.703677	7	\N	\N	0	\N	none	\N	["Abhijit Das"]	["abhijit520das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
7	1	Deploy in AWS	deploy it using various aws service	Abhijit Das	high	in_progress	2026-06-25	Task Reminder: Deployment in AWS\nAbhijit Das is assigned to deploy in AWS by 2026-06-25. This task has a high priority and requires prompt attention to ensure timely completion. Please review the task details and take necessary actions to meet the deadline.	2026-06-09 10:55:00.95476	2026-06-10 08:30:10.462439	\N	\N	\N	45	2 days	daily	2026-06-25	["Abhijit Das"]	["abhijit520das@gmail.com"]	d6534dd4b7aa44818160c4caed922214	Deploy the application in Amazon Web Services (AWS) utilizing various AWS services such as EC2, S3, RDS, and Lambda to ensure a scalable and secure infrastructure. This deployment should be completed in accordance with best practices for security, high availability, and performance. The task requires careful planning, execution, and testing to ensure a successful deployment by the deadline of 2026-06-25.	High Priority: AWS Deployment by 2026-06-25	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\tasks\\task_7_Deploy_in_AWS.pdf	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\tasks\\task_7_Deploy_in_AWS.docx	2026-06-09 10:55:36.693204	\N
16	1	Deploy frontend application	Subtask for: Deploy in AWS	Abhijit Das	high	pending	2026-06-25	Task Reminder: Deployment of Frontend Application\n\nDear Abhijit Das, \n\nYou are assigned to deploy the frontend application by 2026-06-25. This task is of high priority and requires your prompt attention. Please ensure timely completion to meet the deadline.\n\nBest regards,\nOperations Team	2026-06-09 10:55:22.703677	2026-06-09 10:55:22.703677	7	\N	\N	0	\N	none	\N	["Abhijit Das"]	["abhijit520das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
17	1	Test production workflow	Subtask for: Deploy in AWS	Abhijit Das	high	pending	2026-06-25	Task Reminder: Test Production Workflow\nAbhijit Das is assigned to test the production workflow with a due date of June 25, 2026. This task is considered high priority and requires prompt attention to ensure timely completion. Please review and complete the task as soon as possible.	2026-06-09 10:55:22.703677	2026-06-09 10:55:22.703677	7	\N	\N	0	\N	none	\N	["Abhijit Das"]	["abhijit520das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
27	1	Test complete workflow	Subtask for: Develop Backend	Abhijit Das	low	pending	2026-06-16	Task Reminder: Test Complete Workflow\nAbhijit Das is assigned to test the complete workflow by 2026-06-16. This task has a low priority. Please ensure to complete the task by the due date to maintain a smooth workflow. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-10 07:10:45.974936	2026-06-10 07:10:45.974936	18	\N	\N	0	\N	none	\N	["Abhijit Das"]	["surajit420das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
28	1	Prepare final review	Subtask for: Develop Backend	Abhijit Das	low	pending	2026-06-16	Task Reminder: Final Review Preparation\nAbhijit Das is assigned to prepare the final review, which is due on June 16, 2026. This task has a low priority. Please ensure timely completion to meet the deadline. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-10 07:10:45.974936	2026-06-10 07:10:45.974936	18	\N	\N	0	\N	none	\N	["Abhijit Das"]	["surajit420das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
19	1	Analyze requirement for Develop Backend	Subtask for: Develop Backend	Abhijit Das	low	pending	2026-06-16	Task Reminder: Analysis for Backend Development\nAbhijit Das is assigned to analyze the requirements for developing the backend. The task is due on 2026-06-16 and has a low priority. Please review and complete the analysis by the due date to ensure timely progress.	2026-06-10 07:10:42.743986	2026-06-10 07:10:42.743986	18	\N	\N	0	\N	none	\N	["Abhijit Das"]	["surajit420das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
20	1	Create backend implementation	Subtask for: Develop Backend	Abhijit Das	low	pending	2026-06-16	Task Reminder: Backend Implementation\nAbhijit Das is assigned to create the backend implementation with a due date of 2026-06-16. This task has been designated as low priority. Please ensure timely completion of this task to meet the project requirements. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-10 07:10:42.743986	2026-06-10 07:10:42.743986	18	\N	\N	0	\N	none	\N	["Abhijit Das"]	["surajit420das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
21	1	Create frontend implementation	Subtask for: Develop Backend	Abhijit Das	low	pending	2026-06-16	Task Reminder: Frontend Implementation\nAbhijit Das is assigned to create the frontend implementation with a due date of 2026-06-16. This task has been designated as low priority. Please review and proceed accordingly to ensure timely completion.	2026-06-10 07:10:42.743986	2026-06-10 07:10:42.743986	18	\N	\N	0	\N	none	\N	["Abhijit Das"]	["surajit420das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
22	1	Test complete workflow	Subtask for: Develop Backend	Abhijit Das	low	pending	2026-06-16	Task Reminder: Test Complete Workflow\nAbhijit Das is assigned to test the complete workflow. The task is due on 2026-06-16 and has a low priority. Please ensure to complete the task by the designated due date. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-10 07:10:42.743986	2026-06-10 07:10:42.743986	18	\N	\N	0	\N	none	\N	["Abhijit Das"]	["surajit420das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
23	1	Prepare final review	Subtask for: Develop Backend	Abhijit Das	low	pending	2026-06-16	Task Reminder: Final Review Preparation\nAbhijit Das is assigned to prepare the final review, which is due on June 16, 2026. This task has been designated as low priority. Please ensure timely completion of the review to meet the scheduled deadline. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-10 07:10:42.743986	2026-06-10 07:10:42.743986	18	\N	\N	0	\N	none	\N	["Abhijit Das"]	["surajit420das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
24	1	Analyze requirement for Develop Backend	Subtask for: Develop Backend	Abhijit Das	low	pending	2026-06-16	Task Reminder: Analyze Requirement for Develop Backend\nAbhijit Das is assigned to analyze the requirement for developing the backend. The task is due on 2026-06-16 and has a low priority. Please review and complete the analysis by the due date to ensure timely progress.	2026-06-10 07:10:45.974936	2026-06-10 07:10:45.974936	18	\N	\N	0	\N	none	\N	["Abhijit Das"]	["surajit420das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
25	1	Create backend implementation	Subtask for: Develop Backend	Abhijit Das	low	pending	2026-06-16	Task Reminder: Backend Implementation\nAbhijit Das is assigned to create the backend implementation with a due date of 2026-06-16. This task has been designated as low priority. Please ensure timely completion of this task to meet the project requirements. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-10 07:10:45.974936	2026-06-10 07:10:45.974936	18	\N	\N	0	\N	none	\N	["Abhijit Das"]	["surajit420das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
26	1	Create frontend implementation	Subtask for: Develop Backend	Abhijit Das	low	pending	2026-06-16	Task Reminder: Frontend Implementation\nAbhijit Das is assigned to create the frontend implementation with a due date of 2026-06-16. This task has been designated as low priority. Please review and proceed accordingly to ensure timely completion.	2026-06-10 07:10:45.974936	2026-06-10 07:10:45.974936	18	\N	\N	0	\N	none	\N	["Abhijit Das"]	["surajit420das@gmail.com"]	\N	\N	\N	\N	\N	\N	\N
18	1	Develop Backend	make backend using python, FastAPI	Abhijit Das	low	completed	2026-06-16	Task Reminder: Backend Development\nAbhijit Das is assigned to develop the backend of the project. The task is due on 2026-06-16 and has a low priority. Please ensure timely completion of the task to meet the project deadline. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-09 11:06:44.475291	2026-06-11 03:06:39.705385	\N	\N	\N	100	2 days	weekly	2026-06-16	["Abhijit Das"]	["surajit420das@gmail.com"]	0c3c5ab97d6a46d989706b8c8aafb568	Develop a robust and scalable backend infrastructure using Python and FastAPI. The backend should be designed to handle high traffic and provide a secure, reliable, and efficient data exchange between the frontend and database. Ensure the implementation follows best practices for coding standards, error handling, and documentation. The deadline for this task is 2026-06-16, and it is considered a low-priority task.	Backend Development Task Assignment	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\tasks\\task_18_Develop_Backend.pdf	C:\\Users\\abhijitdas\\Documents\\operations-agent\\backend\\outputs\\tasks\\task_18_Develop_Backend.docx	2026-06-09 11:07:01.004826	\N
31	1	Develop UI	create ui design using figma	Abhijit Das	high	in_progress	2026-06-16	Task Reminder: UI Development\nAbhijit Das is assigned to develop the user interface, with a due date of June 16, 2026. This task has been designated as high priority. Please ensure timely completion to meet project requirements. If you have any questions or concerns, please do not hesitate to reach out.	2026-06-10 10:24:19.245405	2026-06-11 02:40:49.295483	\N	\N	\N	100	2 days	daily	2026-06-16	["Abhijit Das"]	["surajit420das@gmail.com"]	471d2a748a36497bb75a721e160bc513	Design and develop a visually appealing and user-friendly UI using Figma, ensuring consistency with our brand guidelines and adhering to best practices for user experience. The design should be fully functional and ready for implementation by the deadline of 2026-06-16.	High Priority: UI Design Development using Figma	\N	\N	\N	\N
\.


--
-- Data for Name: user_smtp_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_smtp_settings (id, user_id, provider, smtp_host, smtp_port, smtp_email, encrypted_app_password, from_name, is_active, created_at, updated_at) FROM stdin;
1	1	gmail	smtp.gmail.com	587	surajit420das@gmail.com	gAAAAABqIm1355iKRcmFUPy8-84JKAuDBEgr7JgCnKPSVkD0EJEe9RsAtc-7DnRED7tU1tS22oIGyNwIRjb0PxoMLQz1AIylHSfXB6Q98Nk7gUdWDupLCGQ=	Abhijit Das	1	2026-06-05 06:32:23.31326	2026-06-05 06:32:23.31326
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, full_name, designation, hashed_password, created_at) FROM stdin;
1	abhijit	surajit420das@gmail.com	Abhijit Das	Trainee	$2b$12$/QW65kuf2KCZ70Af7n7T0eBOWZ2cC3ySomJHeJKL6zgjQ0bIyn0Qy	2026-06-05 06:31:27.857633
2	Surajit	abhijit520das@gmail.com	Surajit Das	Team Lead	$2b$12$RSAIF7upSKODOMzJKaxFFu80VAW1JmHvg6WBSTSqmBT7kz94KuYaW	2026-06-11 03:16:12.097309
\.


--
-- Name: document_exports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.document_exports_id_seq', 17, true);


--
-- Name: email_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_history_id_seq', 1, true);


--
-- Name: meeting_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meeting_history_id_seq', 3, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: report_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.report_history_id_seq', 3, true);


--
-- Name: task_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_attachments_id_seq', 1, false);


--
-- Name: task_checklist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_checklist_items_id_seq', 99, true);


--
-- Name: task_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_comments_id_seq', 1, true);


--
-- Name: task_external_updates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_external_updates_id_seq', 2, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 31, true);


--
-- Name: user_smtp_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_smtp_settings_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: document_exports document_exports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_exports
    ADD CONSTRAINT document_exports_pkey PRIMARY KEY (id);


--
-- Name: email_history email_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_history
    ADD CONSTRAINT email_history_pkey PRIMARY KEY (id);


--
-- Name: meeting_history meeting_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_history
    ADD CONSTRAINT meeting_history_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: report_history report_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_history
    ADD CONSTRAINT report_history_pkey PRIMARY KEY (id);


--
-- Name: task_attachments task_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_pkey PRIMARY KEY (id);


--
-- Name: task_checklist_items task_checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_checklist_items
    ADD CONSTRAINT task_checklist_items_pkey PRIMARY KEY (id);


--
-- Name: task_comments task_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id);


--
-- Name: task_external_updates task_external_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_external_updates
    ADD CONSTRAINT task_external_updates_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: user_smtp_settings user_smtp_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_smtp_settings
    ADD CONSTRAINT user_smtp_settings_pkey PRIMARY KEY (id);


--
-- Name: user_smtp_settings user_smtp_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_smtp_settings
    ADD CONSTRAINT user_smtp_settings_user_id_key UNIQUE (user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_document_exports_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_document_exports_id ON public.document_exports USING btree (id);


--
-- Name: ix_email_history_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_email_history_id ON public.email_history USING btree (id);


--
-- Name: ix_meeting_history_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_meeting_history_id ON public.meeting_history USING btree (id);


--
-- Name: ix_password_reset_tokens_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_password_reset_tokens_id ON public.password_reset_tokens USING btree (id);


--
-- Name: ix_password_reset_tokens_token_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_password_reset_tokens_token_hash ON public.password_reset_tokens USING btree (token_hash);


--
-- Name: ix_report_history_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_report_history_id ON public.report_history USING btree (id);


--
-- Name: ix_task_attachments_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_task_attachments_id ON public.task_attachments USING btree (id);


--
-- Name: ix_task_comments_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_task_comments_id ON public.task_comments USING btree (id);


--
-- Name: ix_tasks_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_tasks_id ON public.tasks USING btree (id);


--
-- Name: ix_user_smtp_settings_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_smtp_settings_id ON public.user_smtp_settings USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: document_exports document_exports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_exports
    ADD CONSTRAINT document_exports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: email_history email_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_history
    ADD CONSTRAINT email_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: meeting_history meeting_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_history
    ADD CONSTRAINT meeting_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: report_history report_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_history
    ADD CONSTRAINT report_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: task_attachments task_attachments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: task_attachments task_attachments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: task_checklist_items task_checklist_items_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_checklist_items
    ADD CONSTRAINT task_checklist_items_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_comments task_comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: task_comments task_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: task_external_updates task_external_updates_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_external_updates
    ADD CONSTRAINT task_external_updates_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_smtp_settings user_smtp_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_smtp_settings
    ADD CONSTRAINT user_smtp_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict q56bMB8rs6vbKDjaLz0bFm0oiDbNfhGCB1qbGmrdKOwUPSK6yauIYrggz8hiTyK

