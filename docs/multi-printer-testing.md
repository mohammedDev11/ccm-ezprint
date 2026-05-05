# Multi-Printer Testing

## Current HP printer setup

The working HP MFP M830 is configured from backend environment values:

- `PRINT_TRANSPORT=socket`
- `PRINT_SOCKET_PORT=9100`
- `PRINT_DEFAULT_PRINTER_IP`
- `PRINT_DEFAULT_PRINTER_NAME`
- `PRINT_DEFAULT_PRINTER_MODEL`
- `PRINT_DEFAULT_PRINTER_BUILDING`
- `PRINT_DEFAULT_PRINTER_ROOM`
- `PRINT_DEFAULT_PRINTER_LOCATION_CODE`
- `PRINT_DEFAULT_PRINTER_DEPARTMENT`
- `PRINT_DEFAULT_QUEUE_NAME`
- `PRINT_DEFAULT_COST_PER_PAGE`

On backend startup, `ensureDefaultPrinterSetup()` upserts this printer into the
`printers` collection by IP/name and creates or updates the default secure-release
queue. The queue stores the HP printer as its default printer, and the printer
stores a back-reference to the queue.

When a PDF is uploaded through the print flow, the backend stores the file,
wraps it as a private printer-hold job when required, and sends it over the
existing socket/raw path to port `9100`. The HP printer then shows the job in
its secure/private job system using the job name, username, and release code.

## Adding another printer

Add the second printer as environment configuration. Either use indexed env vars:

```env
PRINT_PRINTER_2_IP=
PRINT_PRINTER_2_NAME=
PRINT_PRINTER_2_MODEL=
PRINT_PRINTER_2_BUILDING=
PRINT_PRINTER_2_ROOM=
PRINT_PRINTER_2_LOCATION_CODE=
PRINT_PRINTER_2_DEPARTMENT=
PRINT_PRINTER_2_QUEUE_NAME=
PRINT_PRINTER_2_COST_PER_PAGE=
PRINT_PRINTER_2_CAPABILITIES=B&W,Duplex,Secure Release,PDF
```

Or use JSON:

```env
PRINT_ADDITIONAL_PRINTERS_JSON=[{"ipAddress":"","name":"","model":"","building":"","room":"","locationCode":"","department":"CCM","queueName":"","costPerPage":0.05,"capabilities":["B&W","Duplex","Secure Release","PDF"]}]
```

Required fields:

- IP address
- Name
- Model
- Building/room or location code
- Department
- Queue name
- Cost per page
- Capabilities

If `queueName` is omitted, the printer is added to the same default secure-release
queue as the HP printer. That is the recommended setup for the multi-destination
test because one submitted job will be sent to every eligible printer assigned to
that queue.

The provisioner is idempotent. It matches printers by IP first, then by name, so
restarting the backend updates the existing printer record instead of creating
duplicates.

## Testing

### Tomorrow checklist

1. Connect the laptop/server to a network that can resolve and reach MongoDB
   Atlas.
2. Start the backend.
3. Confirm the backend logs `MongoDB connected`.
4. Confirm `/api/v1/admin/queues` includes the configured Secure Release queue.
5. Confirm `/api/v1/admin/printers` includes HP MFP M830 and the new printer.
6. Confirm both printers are assigned to the Secure Release queue.
7. Open `/sections/user/print`.
8. Confirm the Secure Release queue is selected or selectable.
9. Upload one PDF.
10. Submit the job.
11. Check HP MFP M830 for the held/secure job.
12. Finish the new printer-side secure/raw printing setup if needed.
13. Check the new printer for the same held/secure job.

If the queue picker shows a MongoDB error such as
`getaddrinfo ENOTFOUND ...mongodb.net`, the frontend is reaching the backend but
the backend cannot resolve or connect to MongoDB. Fix network/DNS/VPN/Atlas
access before testing the print flow.

### Scenario A: HP printer

1. Start the backend.
2. Confirm `/api/v1/admin/printers` includes the HP MFP M830.
3. Upload a PDF from the user print flow.
4. Select the secure-release queue.
5. Submit the job.
6. Go to the HP printer.
7. Confirm the job appears in the printer hold/private job system.

### Scenario B: HP plus second printer

1. Add the second printer env values.
2. Restart the backend so the provisioner upserts the printer and queue mapping.
3. Confirm `/api/v1/admin/printers` includes both printers.
4. Confirm the queue has both printers assigned.
5. Upload a PDF from the user print flow.
6. Submit the job to the secure-release queue.
7. Go to the HP printer and confirm the job appears.
8. Go to the second printer and confirm the same job appears.

## Notes

- HP MFP M830 already works. Do not change its IP, transport, queue, or printer
  side settings for the demo.
- The existing socket/raw transport is unchanged.
- `PRINT_TRANSPORT`, queue handling, and release endpoints are unchanged.
- The HP printer remains the default printer for the default queue.
- Additional printer dispatch is best-effort after the default printer succeeds,
  so an extra printer outage does not break the already-working HP flow.
- Printers must allow raw socket printing on the configured port.
- The new printer must support raw socket printing on `PRINT_SOCKET_PORT`
  or expose an equivalent raw printing interface.
- Secure/private hold behavior depends on printer support for the PJL hold
  commands used by the existing HP flow. If the second printer uses a different
  hold protocol, configure the printer side to accept the current raw/PJL job
  format or add a separate printer-specific formatter in a future targeted change.
- Backend code should already be ready before the physical test. Tomorrow should
  only require network connectivity, app startup, new printer-side setup, and a
  PDF upload from `/sections/user/print`.
