const fs = require('node:fs');

// Adapted from https://github.com/mdn/dom-examples/blob/main/web-crypto/import-key/spki.js
function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
function importPublicKey(pem) {
    // fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    // base64 decode the string to get the binary data
    const binaryDerString = atob(pemContents);
    // convert from a binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString);

    return crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["encrypt"]
    );
}

async function encrypt(input, output) {
    const rsa_key = await importPublicKey(`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzPtuUqJecaR/wWtctGT8
QuVslmDH3Ut3s8c1Ls4A+M9rwpeLjgDUqfcrSrTHBrl5k/dOeJEWMeNF7STWS5jo
WZE0H60cvf2bhormC9S6CRwq4Lw0ua0YQMo66R/qCtLVa5w6WkaPCz4b0xaHWtej
JH49C0T67rU2DkepXuMPpwNCflMU+WgEQioZEldUTD6gYpu2U5GrW4AE0AQiIo+j
e7tgN8PlBMbMaEfu0LokZyth1ugfuLAgyogWnedAegQmPZzAUe36Sni94AsDlhxm
mjFl+WQZzD3MclbEY6KQB5XL8zCR/J6pCUUwfHantLxY/gQi0XJG5hWWtDyH/fR2
lwIDAQAB
-----END PUBLIC KEY-----`);

    const aes_keydata = crypto.getRandomValues(new Uint8Array(16));
    const aes_key = await crypto.subtle.importKey('raw', aes_keydata, { "name": 'AES-GCM' }, true, [ 'encrypt' ]);
    const aes_iv = crypto.getRandomValues(new Uint8Array(16));

    const encrypted_aes_keydata = await crypto.subtle.encrypt({
        name: 'RSA-OAEP'
    }, rsa_key, aes_keydata);

    const encrypted_aes_iv = await crypto.subtle.encrypt({
        name: 'RSA-OAEP'
    }, rsa_key, aes_iv);

    const encrypted_payload = await crypto.subtle.encrypt({
        name: "AES-GCM",
        iv: aes_iv
    }, aes_key, fs.readFileSync(input).buffer);

    const fd = fs.openSync(output, 'w');
    fs.writeSync(fd, Buffer.from(encrypted_aes_keydata));
    fs.writeSync(fd, Buffer.from(encrypted_aes_iv));
    fs.writeSync(fd, Buffer.from(encrypted_payload));
    fs.closeSync(fd);
}

if (process.argv.length == 4) {
    encrypt(process.argv[2], process.argv[3]);
} else {
    console.log(`Usage: ${process.argv[0]} ${process.argv[1]} input.svg output.FCTS`)
}
