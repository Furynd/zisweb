
## Development

1. Supabase schema
```
Create a Supabase schema setup script (SQL).

a single transaction should store:
donor_name, full address, phone, timestamps, multiple amounts for each TransactionType, total amount, total rice amount, payment method, operator_id, optional transfer_receipt

Enable Row Level Security (RLS).

Create a policy: 'Public can view stats', 'Only authenticated users (Operators) can insert transactions', 'Only superadmin can edit/update transactions'.

```

2. Dashboard
```
Create a dashboard page at /dashboard protected by Supabase Auth. It should have a clean form to 'Record New Donation'. adjust fields to stored transaction data. When submitted, save to Supabase and show a toast notification.
```

3. Login Page
```
create a login page for operators. operator registration should be done only from superadmin page. Create a seeder for default superadmin if not yet available
```