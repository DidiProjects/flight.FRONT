BUG: quando eu atualizo a página estamos com uma request de refresh com erro:
strict-origin-when-cross-origin
parece que estamos fazendo uma sem configurações de header, logo depois fazemos outra com suceso.

BUG:

estou recebendo minhas rotinas: 
[
    {
        "id": "776ed8a6-ef16-4c47-b861-fafaa9af366a",
        "user_id": "3833dc2b-d0bd-42b9-83f9-1088dd8e29c6",
        "name": "teste 123",
        "airline": "azul",
        "origin": "GRU",
        "destination": "LIS",
        "outbound_start": "2026-07-05T00:00:00.000Z",
        "outbound_end": "2026-07-05T00:00:00.000Z",
        "return_start": null,
        "return_end": null,
        "passengers": 1,
        "target_brl": "5000.00",
        "target_pts": null,
        "target_hyb_pts": null,
        "target_hyb_brl": null,
        "margin": "0.100",
        "priority": "brl",
        "notification_mode": "alert_only",
        "notification_frequency": "hourly",
        "end_of_period_time": null,
        "cc_emails": [],
        "pending_request_id": null,
        "pending_request_at": null,
        "is_active": true,
        "created_at": "2026-04-25T22:41:26.958Z",
        "updated_at": "2026-04-25T22:41:26.958Z"
    },
    {
        "id": "d04fb8af-fb2d-488f-8a4f-ddd2f91d97db",
        "user_id": "3833dc2b-d0bd-42b9-83f9-1088dd8e29c6",
        "name": "voo pra casa",
        "airline": "azul",
        "origin": "LIS",
        "destination": "VCP",
        "outbound_start": "2026-06-30T00:00:00.000Z",
        "outbound_end": "2026-06-30T00:00:00.000Z",
        "return_start": null,
        "return_end": null,
        "passengers": 1,
        "target_brl": "5000.00",
        "target_pts": null,
        "target_hyb_pts": null,
        "target_hyb_brl": null,
        "margin": "0.100",
        "priority": "brl",
        "notification_mode": "daily_best_and_alert",
        "notification_frequency": "hourly",
        "end_of_period_time": null,
        "cc_emails": [],
        "pending_request_id": null,
        "pending_request_at": null,
        "is_active": true,
        "created_at": "2026-04-25T22:17:13.877Z",
        "updated_at": "2026-04-25T23:00:45.683Z"
    }
]

mas o resultado delas não estão aparecendo em tela, vejo os cards de cada rotina mas seus parâmetros estão vazios.

BUG: quando rodo deploy parece que não estamos passando as envs corretamente pra interface:
quando faço o login bato na rota: https://flight-scraping.netlify.app/undefined/auth/login

por exemplo, deveria ser a: https://api.didilv93.com/flight que está configurada corretamente no github em variables.

Quero uma performance melhor nos meus campos de entrada de texto, quero que eles renderizem apenas quando necessário. Pode aplicar debounce, pra digitação.
