create extension if not exists "pgcrypto";

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  type text not null check (type in ('text', 'file')),
  file_url text,
  file_name text,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);
