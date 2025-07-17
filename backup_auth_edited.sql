--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Ubuntu 14.18-1.pgdg22.04+1)
-- Dumped by pg_dump version 17.5 (Ubuntu 17.5-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: LoginHistory; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public."LoginHistory" (
    id text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    device text,
    country text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LoginHistory" OWNER TO avnadmin;

--
-- Name: User; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    password text,
    "twoFactorSecret" text,
    "twoFactorEnabled" boolean DEFAULT false NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "verificationToken" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "resetPasswordToken" text,
    "resetPasswordTokenExpiry" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO avnadmin;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO avnadmin;

--
-- Data for Name: LoginHistory; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public."LoginHistory" (id, "userId", action, device, country, "timestamp") FROM stdin;
ae15df26-0219-40ea-bb93-203b48d22d34	af598326-299c-4787-96ea-23509b08d1f0	signIn	Ubuntu - Firefox	::ffff:127.0.0.1	2025-07-09 06:55:53.008
22642e13-0272-47d1-8924-4063b620f9a3	af598326-299c-4787-96ea-23509b08d1f0	signIn	Ubuntu - Firefox	::ffff:127.0.0.1	2025-07-09 07:00:15.712
305bede1-5c0e-43e7-857e-80a2326dd80f	af598326-299c-4787-96ea-23509b08d1f0	signIn	Ubuntu - Firefox	::ffff:127.0.0.1	2025-07-09 07:07:31.836
58858ca4-bf31-4a34-89e7-d4fe2bdfafee	af598326-299c-4787-96ea-23509b08d1f0	signIn	Ubuntu - Firefox	::ffff:127.0.0.1	2025-07-09 07:19:10.93
ab0167a5-d04e-4731-bceb-74c158c2b838	af598326-299c-4787-96ea-23509b08d1f0	signIn	Ubuntu - Firefox	::ffff:127.0.0.1	2025-07-09 07:37:03.648
f218c647-1061-4e5f-9b53-2becce61fc5b	af598326-299c-4787-96ea-23509b08d1f0	signIn	Ubuntu - Firefox	::ffff:127.0.0.1	2025-07-09 07:37:40.473
0b7421f6-1b4b-4454-9e15-ffb91485a98e	af598326-299c-4787-96ea-23509b08d1f0	signIn	Ubuntu - Firefox	::ffff:127.0.0.1	2025-07-09 07:38:46.249
87956f6e-fc3b-4634-b267-4f4f54c22db8	af598326-299c-4787-96ea-23509b08d1f0	signIn	Ubuntu - Firefox	::ffff:127.0.0.1	2025-07-09 07:39:04.899
2fba5f23-0361-4100-a5df-7ec1244eb714	af598326-299c-4787-96ea-23509b08d1f0	signIn	Ubuntu - Firefox	::ffff:127.0.0.1	2025-07-09 09:56:45.824
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public."User" (id, email, name, password, "twoFactorSecret", "twoFactorEnabled", "emailVerified", "verificationToken", "createdAt", "updatedAt", "resetPasswordToken", "resetPasswordTokenExpiry") FROM stdin;
af598326-299c-4787-96ea-23509b08d1f0	bentwannes@gmail.com	maryem	$2b$10$XgRpwhs2G5u.OpHrbuHchec3amaV8/vIgQWrFuEVXY5k6ZGORc6jK	\N	f	t	\N	2025-07-09 06:55:05.309	2025-07-09 06:55:35.164	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
dfed2f1c-acb5-40f6-81aa-e7ac7eb7bdd4	49422e3da90530e4697ad54855752c16ff50228a64110f7903966b463091083e	2025-07-01 22:08:37.22821+01	20250625131151_init	\N	\N	2025-07-01 22:08:37.214768+01	1
97f0a6fa-b11c-49b4-9b5e-5fd0b58d7fcf	c502c38cadb8cdf890b7a842ffbfe12e1975ed43f9af8d753ab9599560f98005	2025-07-02 17:22:14.020188+01	20250702162213_log	\N	\N	2025-07-02 17:22:13.992508+01	1
fad04c14-0699-47c2-868b-a27f19ceb5f7	21ede0bddc684f58d27b9984e9d927ca3ac3390e570e9770d71bea2b1cc6bd04	2025-07-07 14:02:31.370713+01	20250707130231_add_reset_password_fields	\N	\N	2025-07-07 14:02:31.364803+01	1
\.


--
-- Name: LoginHistory LoginHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public."LoginHistory"
    ADD CONSTRAINT "LoginHistory_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: LoginHistory LoginHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public."LoginHistory"
    ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

