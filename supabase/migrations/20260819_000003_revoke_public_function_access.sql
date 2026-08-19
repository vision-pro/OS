-- PostgreSQL grants EXECUTE to PUBLIC by default for newly created functions.
-- Revoke that implicit privilege explicitly; public forms now use constrained
-- RLS inserts, while the profile helper is trigger-only.

revoke all on function public.create_booking(text, text, text, uuid, text, text, text, text, text) from public;
revoke all on function public.create_contact_request(text, text, text, text, text, text) from public;
revoke all on function public.handle_new_user() from public;
