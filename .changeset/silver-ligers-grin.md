---
"@latticexyz/world": major
---

- Split `CoreSystem` into `AccessManagementSystem`, `BalanceTransferSystem`, `BatchCallSystem`, `CoreRegistrationSystem`
- Changed `CoreModule` to receive the addresses of these systems as arguments, instead of deploying them
- Replaced `CORE_SYSTEM_ID` constant with `ACCESS_MANAGEMENT_SYSTEM_ID`, `BALANCE_TRANSFER_SYSTEM_ID`, `BATCH_CALL_SYSTEM_ID`, `CORE_REGISTRATION_SYSTEM_ID`, for each respective system

These changes separate the initcode of `CoreModule` from the bytecode of core systems, which effectively removes a limit on the total bytecode of all core systems.
