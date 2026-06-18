# Color & Balayage — Cristina Barbu

Site salon + rezervări online + panou administrare.

**Live:** https://cristina-barbu-salon.vercel.app  
**Admin:** https://cristina-barbu-salon.vercel.app/admin

## Panou administrare

La `/admin` poți:

- vedea toate rezervările (num, telefon, serviciu, oră)
- anula o rezervare
- bloca zile (concediu, liber) — clienții nu mai pot rezerva în acele zile
- primești email la fiecare rezervare nouă (dacă configurezi Resend)

### Configurare (obligatoriu pentru producție)

#### 1. Supabase (bază de date gratuită)

1. Creează cont pe [supabase.com](https://supabase.com)
2. Proiect nou → **SQL Editor** → lipește conținutul din `supabase/schema.sql` → **Run**
3. **Settings → API** → copiază:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

#### 2. Variabile de mediu

Copiază `.env.example` în `.env.local` (local) și adaugă aceleași variabile în **Vercel → Project → Settings → Environment Variables**:

| Variabilă | Descriere |
|-----------|-----------|
| `SUPABASE_URL` | URL proiect Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Cheie service role (secret) |
| `ADMIN_PASSWORD` | Parola ta pentru `/admin` |
| `SALON_NOTIFY_EMAIL` | Email unde primești rezervările |
| `RESEND_API_KEY` | Cheie API de la [resend.com](https://resend.com) (opțional) |
| `RESEND_FROM_EMAIL` | Expeditor verificat în Resend (opțional) |

#### 3. Redeploy pe Vercel

După ce adaugi variabilele, fă redeploy ca să intre în vigoare.

### Dezvoltare locală

```bash
npm install
cp .env.example .env.local
# completează .env.local
npm run dev
```

Fără Supabase, rezervările se salvează local în `data/` (doar pentru test pe calculator).

## Comenzi

```bash
npm run dev      # localhost:3000
npm run dev:lan  # accesibil din rețea (telefon)
npm run build
```
