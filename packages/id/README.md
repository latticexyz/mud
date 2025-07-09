# TODO

## iframe communication

```
client: creates iframe with host
host: creates message port with parent
host: syncs data relevant to parent origin
      (list of accounts, if trusted, empty otherwise)

client: if untrusted, ask host to trust origin
host: asks user if they trust origin
      (yes defaults to all accounts, in future user can pick accounts)
host: syncs data relevant to parent origin
      (list of accounts)


```
