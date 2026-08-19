-- Public booking/contact forms are intentionally simple single-table writes.
-- Use RLS rather than exposed SECURITY DEFINER functions; public clients never
-- receive read, update, or delete access to these operational records.

revoke all on function public.create_booking(text, text, text, uuid, text, text, text, text, text) from anon, authenticated;
revoke all on function public.create_contact_request(text, text, text, text, text, text) from anon, authenticated;
revoke all on function public.handle_new_user() from anon, authenticated;

grant insert on public.bookings to anon, authenticated;
grant insert on public.contact_requests to anon, authenticated;

drop policy if exists public_booking_insert on public.bookings;
create policy public_booking_insert on public.bookings
  for insert to anon, authenticated
  with check (
    status = 'new'
    and preferred_language in ('ar', 'en')
    and char_length(trim(name)) >= 2
    and char_length(trim(phone)) >= 5
  );

drop policy if exists public_contact_request_insert on public.contact_requests;
create policy public_contact_request_insert on public.contact_requests
  for insert to anon, authenticated
  with check (
    status = 'new'
    and preferred_language in ('ar', 'en')
    and char_length(trim(name)) >= 2
    and char_length(trim(message)) >= 3
  );
