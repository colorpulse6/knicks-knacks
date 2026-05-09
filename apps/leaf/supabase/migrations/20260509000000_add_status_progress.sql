alter table books
  add column if not exists status text not null default 'want_to_read',
  add column if not exists pages_read int not null default 0,
  add column if not exists percent_complete float not null default 0;

update books
set
  status = coalesce(status, 'want_to_read'),
  pages_read = coalesce(pages_read, 0),
  percent_complete = coalesce(percent_complete, 0);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'books_status_check'
  ) then
    alter table books
      add constraint books_status_check
      check (status in ('want_to_read', 'reading', 'finished', 'paused'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'books_pages_read_check'
  ) then
    alter table books
      add constraint books_pages_read_check
      check (pages_read >= 0);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'books_percent_complete_check'
  ) then
    alter table books
      add constraint books_percent_complete_check
      check (percent_complete >= 0 and percent_complete <= 100);
  end if;
end $$;
