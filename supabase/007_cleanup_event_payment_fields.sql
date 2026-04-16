-- eMeet: limpieza de residuos de ticketing en eventos
-- Ejecutar solo si previamente se aplico 005_locatario_event_payments.sql.
-- La monetizacion real vive en payment_orders, token_wallets y promotion_campaigns.

alter table public.locatario_events
  drop constraint if exists locatario_events_payment_type_check,
  drop constraint if exists locatario_events_payment_provider_check,
  drop constraint if exists locatario_events_currency_check,
  drop constraint if exists locatario_events_payment_status_check,
  drop constraint if exists locatario_events_price_valid,
  drop constraint if exists locatario_events_capacity_valid;

alter table public.locatario_events
  drop column if exists is_paid,
  drop column if exists payment_type,
  drop column if exists payment_provider,
  drop column if exists currency,
  drop column if exists capacity,
  drop column if exists payment_policy,
  drop column if exists payment_status;
