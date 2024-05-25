const fs = require('node:fs');

async function decrypt(input, output) {
    const length = fs.statSync(input)["size"];
    const fd = fs.openSync(input);
    const buffer = new Buffer.alloc(length - 512);
    fs.readSync(fd, buffer, 0, length - 512, 512);
    fs.closeSync(fd);

    // Only correct for test/Fabrication_ColorfulTopSilkscreen.FCTS
    const keydata = new Uint8Array([0x2A, 0x17, 0xAC, 0xBB, 0x07, 0x63, 0xEA, 0x69, 0x43, 0x4B, 0x25, 0x9d, 0xC8, 0x40, 0xEF, 0xEC]);
    const key = await crypto.subtle.importKey('raw', keydata, { "name": 'AES-GCM' }, true, [ 'decrypt' ]);
    const iv = new Uint8Array([0x55, 0xF2, 0xE6, 0xDD, 0xFC, 0x67, 0xAB, 0x10, 0xB3, 0x99, 0x02, 0x52, 0xD7, 0xFB, 0x1C, 0xDD]);

    const decrypted = await crypto.subtle.decrypt({
        name: "AES-GCM",
        iv: iv
    }, key, buffer.buffer);

    fs.writeFileSync(output, Buffer.from(decrypted))
}

if (process.argv.length == 4) {
    decrypt(process.argv[2], process.argv[3]);
} else {
    console.log(`Usage: ${process.argv[0]} ${process.argv[1]} input.FCTS output.svg`)
}
