--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.2

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: express-finpro-sbd21_owner
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    slot_id uuid NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    status character varying(20) NOT NULL,
    is_paid boolean DEFAULT false NOT NULL,
    price integer DEFAULT 3000 NOT NULL,
    paid_at timestamp without time zone,
    qr_code_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bookings_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'booked'::character varying, 'cancelled'::character varying, 'expired'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.bookings OWNER TO "express-finpro-sbd21_owner";

--
-- Name: parking_slots; Type: TABLE; Schema: public; Owner: express-finpro-sbd21_owner
--

CREATE TABLE public.parking_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    location character varying(100) NOT NULL,
    type character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT parking_slots_type_check CHECK (((type)::text = ANY ((ARRAY['car'::character varying, 'motor'::character varying, 'disabled'::character varying])::text[])))
);


ALTER TABLE public.parking_slots OWNER TO "express-finpro-sbd21_owner";

--
-- Name: users; Type: TABLE; Schema: public; Owner: express-finpro-sbd21_owner
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO "express-finpro-sbd21_owner";

--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: express-finpro-sbd21_owner
--

COPY public.bookings (id, user_id, slot_id, start_time, end_time, status, is_paid, price, paid_at, qr_code_url, created_at) FROM stdin;
4cf287a1-4cc9-49a5-9c8f-c83a890c4fb9	e7782ebe-d1b4-4a90-b08b-9e56751ccdfd	a2d6f087-ad9b-4b70-bf12-97ba0c995fd2	2025-05-20 06:08:00	2025-05-20 08:08:00	completed	t	5000	2025-05-20 13:08:53.104891	https://res.cloudinary.com/ddpljzo7b/image/upload/v1747746507/qrcodes/booking_4cf287a1-4cc9-49a5-9c8f-c83a890c4fb9.png	2025-05-20 13:08:25.96844
6972c66d-be26-4128-8188-7aea44ef0225	2f552862-45a0-45ea-8475-24d251be9c8e	b2c59b03-73c2-4294-a192-9cde0190d83b	2025-05-20 03:23:00	2025-05-20 05:23:00	completed	t	5000	2025-05-20 10:23:54.831227	https://res.cloudinary.com/ddpljzo7b/image/upload/v1747736625/qrcodes/booking_6972c66d-be26-4128-8188-7aea44ef0225.png	2025-05-20 10:23:43.913687
64302521-73b2-4c3b-adbc-114311f28eaf	2f552862-45a0-45ea-8475-24d251be9c8e	b2c59b03-73c2-4294-a192-9cde0190d83b	2025-05-20 03:52:00	2025-05-20 05:52:00	completed	t	5000	2025-05-20 10:52:29.518736	https://res.cloudinary.com/ddpljzo7b/image/upload/v1747738343/qrcodes/booking_64302521-73b2-4c3b-adbc-114311f28eaf.png	2025-05-20 10:52:22.248827
763f1d26-c6c9-48a7-a526-928223a12731	e7782ebe-d1b4-4a90-b08b-9e56751ccdfd	210b9d74-8f65-44bb-9e76-20829e9b5993	2025-05-20 04:40:00	2025-05-20 06:40:00	completed	t	5000	2025-05-20 11:40:46.830061	https://res.cloudinary.com/ddpljzo7b/image/upload/v1747741220/qrcodes/booking_763f1d26-c6c9-48a7-a526-928223a12731.png	2025-05-20 11:40:19.175539
e1231284-c7ef-4b7c-97fc-177b29af291c	e7782ebe-d1b4-4a90-b08b-9e56751ccdfd	b2c59b03-73c2-4294-a192-9cde0190d83b	2025-05-19 07:03:00	2025-05-19 09:03:00	completed	t	5000	2025-05-19 14:03:51.430543	https://res.cloudinary.com/ddpljzo7b/image/upload/v1747663415/qrcodes/booking_e1231284-c7ef-4b7c-97fc-177b29af291c.png	2025-05-19 14:03:26.283208
bd6e59ad-0f90-42d9-a547-fe1afb9ddc97	c72352a9-f12b-44c4-bd14-98faa23aaf8b	b2c59b03-73c2-4294-a192-9cde0190d83b	2025-05-27 18:41:00	2025-05-28 09:36:00	completed	t	31000	2025-05-19 14:38:26.334123	https://res.cloudinary.com/ddpljzo7b/image/upload/v1747665469/qrcodes/booking_bd6e59ad-0f90-42d9-a547-fe1afb9ddc97.png	2025-05-19 14:37:47.63552
f28b1615-45f3-48b2-a09b-2f3d86a68eb2	03269881-3b42-4b0e-95e7-ae0846902365	210b9d74-8f65-44bb-9e76-20829e9b5993	2025-05-19 07:38:00	2025-05-19 09:38:00	expired	t	5000	2025-05-19 14:39:07.83652	\N	2025-05-19 14:38:22.46042
c40fb3b5-36eb-4737-b8db-df5d121088bf	c72352a9-f12b-44c4-bd14-98faa23aaf8b	b2c59b03-73c2-4294-a192-9cde0190d83b	2025-05-20 07:40:00	2025-05-20 09:41:00	expired	f	7000	\N	https://res.cloudinary.com/ddpljzo7b/image/upload/v1747665654/qrcodes/booking_c40fb3b5-36eb-4737-b8db-df5d121088bf.png	2025-05-19 14:40:52.766133
32241779-f5ff-4b3b-8061-c39ed3e5f62d	e7782ebe-d1b4-4a90-b08b-9e56751ccdfd	210b9d74-8f65-44bb-9e76-20829e9b5993	2025-05-20 13:42:00	2025-05-20 16:42:00	completed	t	7000	2025-05-20 11:42:58.040161	https://res.cloudinary.com/ddpljzo7b/image/upload/v1747741361/qrcodes/booking_32241779-f5ff-4b3b-8061-c39ed3e5f62d.png	2025-05-20 11:42:40.009118
4ec2a3d2-f89f-4700-a789-cf928c711210	2f552862-45a0-45ea-8475-24d251be9c8e	a2d6f087-ad9b-4b70-bf12-97ba0c995fd2	2025-05-20 02:56:00	2025-05-20 04:56:00	cancelled	t	5000	2025-05-20 09:59:30.970108	https://res.cloudinary.com/ddpljzo7b/image/upload/v1747735030/qrcodes/booking_4ec2a3d2-f89f-4700-a789-cf928c711210.png	2025-05-20 09:57:00.889872
3241f022-d7b3-4f6f-97fb-11a40b6b6fb1	e7782ebe-d1b4-4a90-b08b-9e56751ccdfd	b2c59b03-73c2-4294-a192-9cde0190d83b	2025-05-20 04:41:00	2025-05-20 12:47:00	completed	t	19000	2025-05-20 11:42:15.745947	https://res.cloudinary.com/ddpljzo7b/image/upload/v1747741316/qrcodes/booking_3241f022-d7b3-4f6f-97fb-11a40b6b6fb1.png	2025-05-20 11:41:56.066188
052acebf-7c44-423d-9477-4e9293c7e227	2f552862-45a0-45ea-8475-24d251be9c8e	b2c59b03-73c2-4294-a192-9cde0190d83b	2025-05-20 03:22:00	2025-05-20 05:22:00	cancelled	t	5000	2025-05-20 10:23:13.970805	https://res.cloudinary.com/ddpljzo7b/image/upload/v1747736585/qrcodes/booking_052acebf-7c44-423d-9477-4e9293c7e227.png	2025-05-20 10:22:58.991121
d64717fd-137b-4dcf-8ac1-7ce346e6ab16	e7782ebe-d1b4-4a90-b08b-9e56751ccdfd	a2d6f087-ad9b-4b70-bf12-97ba0c995fd2	2025-05-20 13:11:00	2025-05-20 14:05:00	completed	t	3000	2025-05-20 13:06:12.111231	https://res.cloudinary.com/ddpljzo7b/image/upload/v1747746358/qrcodes/booking_d64717fd-137b-4dcf-8ac1-7ce346e6ab16.png	2025-05-20 13:05:56.832311
\.


--
-- Data for Name: parking_slots; Type: TABLE DATA; Schema: public; Owner: express-finpro-sbd21_owner
--

COPY public.parking_slots (id, location, type, is_active, created_at) FROM stdin;
210b9d74-8f65-44bb-9e76-20829e9b5993	PB-2	motor	t	2025-05-19 14:03:02.748803
b2c59b03-73c2-4294-a192-9cde0190d83b	PB-1	motor	t	2025-05-19 14:02:52.483685
a2d6f087-ad9b-4b70-bf12-97ba0c995fd2	PB-3	motor	t	2025-05-19 14:03:06.05768
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: express-finpro-sbd21_owner
--

COPY public.users (id, name, email, password_hash, created_at) FROM stdin;
2f552862-45a0-45ea-8475-24d251be9c8e	test1	shafwan@test.com	$2b$10$3fLTQepH7M0nThYYvLm1Cufi63BviGB1cZnA2CpjZUzRWp05wr6Za	2025-05-18 13:28:17.029014
e7782ebe-d1b4-4a90-b08b-9e56751ccdfd	yes	shafwan178@gmail.com	$2b$10$NJ3L9v/PcoV15JitohEUauSjJP2YdVVekW8BViuz1H8HI4jNGreVy	2025-05-18 15:10:47.678799
052b3b00-3008-4ee3-b51e-e0e6d6bba15b	test2	shafwan2@test.com	$2b$10$hktusuRj5iQJqG79JMc3QuhQ4dkWVzVLTWSbf.P6yBIBO/LRtEYFi	2025-05-18 18:36:18.147595
7fd56095-0e7c-4ef9-bc2b-29c44b11ba53	Ibnu Zaky Fauzi	zaky@example.com	$2b$10$eV1dj6gbYerj5VZwM4YHCeiGF2Pwuq5mGLuJRfYGddPYb6pN5u9Za	2025-05-19 08:00:56.544431
5419007a-e365-45e3-9a47-a70fd4abd15e	bryan1	bryan1@mail.com	$2b$10$l87QWBT664U0dinhcSJw8uOrO5ghOlCEqLP1oC2GzZptNwPj5m0xG	2025-05-19 08:06:50.23063
03269881-3b42-4b0e-95e7-ae0846902365	bryan	bryan@mail.com	$2b$10$Fgyto/EktNmJj9KFS/SICOQ3E8YNWNPDFBOBVG4s9Ig975wHlaYEK	2025-05-19 13:16:25.606604
c72352a9-f12b-44c4-bd14-98faa23aaf8b	sapwan	shafwan3@test.com	$2b$10$WG1TiQKVsK6M.K9IR0iQfeKCg.pnEsOG8Lcq/njHWy8e2M1kbzO5a	2025-05-19 14:35:08.532211
be07afb2-b9e6-46a6-861c-9597d4924ae0	Fadhlureza	shafwan4@test.com	$2b$10$n3UZLkqFcs6gc3upwnrdceWgKS572yE7IlLC7s3aKblHuksskqa2.	2025-05-19 14:59:54.608146
\.


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: express-finpro-sbd21_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: parking_slots parking_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: express-finpro-sbd21_owner
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT parking_slots_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: express-finpro-sbd21_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: express-finpro-sbd21_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: express-finpro-sbd21_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.parking_slots(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: express-finpro-sbd21_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

