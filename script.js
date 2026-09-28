// IT Toolkit - frontend only

function showError(element, message) {
    element.innerHTML = `<span class="error">${message}</span>`;
}


// =========================
// IP CALCULATOR
// =========================

function ipv4ToNumber(ip) {

    const parts = ip.split(".").map(Number);

    if (
        parts.length !== 4 ||
        parts.some(
            p => !Number.isInteger(p) || p < 0 || p > 255
        )
    ) {
        throw new Error("La dirección IPv4 no es válida.");
    }

    return (
        ((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 +
        parts[3]
    );
}


function numberToIpv4(number) {

    return [
        Math.floor(number / 16777216) % 256,
        Math.floor(number / 65536) % 256,
        Math.floor(number / 256) % 256,
        number % 256
    ].join(".");
}


function calculateNetwork(cidr) {

    const parts = cidr.trim().split("/");

    if (parts.length !== 2) {
        throw new Error(
            "Usa el formato 192.168.1.25/24"
        );
    }

    const prefix = Number(parts[1]);

    if (
        !Number.isInteger(prefix) ||
        prefix < 0 ||
        prefix > 32
    ) {
        throw new Error(
            "El prefijo CIDR debe estar entre 0 y 32."
        );
    }

    const ipNumber = ipv4ToNumber(parts[0]);

    const mask =
        prefix === 0
            ? 0
            : (0xFFFFFFFF << (32 - prefix)) >>> 0;

    const network =
        (ipNumber & mask) >>> 0;

    const broadcast =
        (network | (~mask >>> 0)) >>> 0;

    let firstHost;
    let lastHost;
    let hosts;

    if (prefix === 32) {

        firstHost = network;
        lastHost = network;
        hosts = 1;

    } else if (prefix === 31) {

        firstHost = network;
        lastHost = broadcast;
        hosts = 2;

    } else {

        firstHost = network + 1;
        lastHost = broadcast - 1;
        hosts = broadcast - network - 1;
    }

    return {
        network: numberToIpv4(network),
        broadcast: numberToIpv4(broadcast),
        firstHost: numberToIpv4(firstHost),
        lastHost: numberToIpv4(lastHost),
        hosts
    };
}


document
    .getElementById("calculateIp")
    .addEventListener("click", () => {

        const result =
            document.getElementById("ipResult");

        try {

            const data = calculateNetwork(
                document.getElementById("ipInput").value
            );

            result.innerHTML = `
                <p><strong>Network:</strong> ${data.network}</p>
                <p><strong>Broadcast:</strong> ${data.broadcast}</p>
                <p><strong>First Host:</strong> ${data.firstHost}</p>
                <p><strong>Last Host:</strong> ${data.lastHost}</p>
                <p><strong>Hosts:</strong> ${data.hosts}</p>
            `;

        } catch (error) {

            showError(
                result,
                error.message
            );
        }
    });


// =========================
// PASSWORD GENERATOR
// =========================

document
    .getElementById("generatePassword")
    .addEventListener("click", () => {

        const result =
            document.getElementById("passwordResult");

        const length =
            Number(
                document.getElementById("passwordLength").value
            );

        if (
            !Number.isInteger(length) ||
            length < 4 ||
            length > 128
        ) {

            showError(
                result,
                "La longitud debe estar entre 4 y 128 caracteres."
            );

            return;
        }

        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";

        const values =
            new Uint32Array(length);

        crypto.getRandomValues(values);

        let password = "";

        for (let i = 0; i < length; i++) {

            password +=
                characters[
                    values[i] % characters.length
                ];
        }

        result.textContent = password;
    });


// Generate password when the page loads
document
    .getElementById("generatePassword")
    .click();