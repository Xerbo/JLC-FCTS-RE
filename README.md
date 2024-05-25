# JLC-FCTS-RE

Reverse engineering of JLCPCB's "FCTS" silkscreen format.

## Format

- RSA2048 encrypted AES key
- RSA2048 encrypted AES IV
- AES-GCM encrypted SVG payload

These blobs are then simply appended in order

## Encrypt

Use `encrypt.js`, the output file will be generated with a different key every time.

## Decrypt

You will need to get the key/IV of the file from developer tools, without JLCPCB's private key it is impossible to decrypt the RSA header.

Once you have these edit and run `decrypt.js`.

## Test files

`test/Fabrication_ColorfulTopSilkscreen.FCTS` is encrypted with:

```
Key: 0x2A17ACBB0763EA69434B259DC840EFEC
IV: 0x55F2E6DDFC67AB10B3990252D7FB1CDD
```
