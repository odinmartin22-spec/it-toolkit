// ==============================
// IT Toolkit - Frontend only
// ==============================

// ---------- Helpers ----------

function showError(element, message) {
    element.innerHTML = `<span class="error">${message}</span>`;
}

function showSuccess(element, message) {
    element.innerHTML = `<span class="success">${message}</span>`;
}

// ---------- IP Calculator ----------

function ipv4ToNumber(ip) {
    const parts = ip.split(".").map(Number);

    if (
        parts.length !== 4 ||
        parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)
    ) {
        throw new Error("Dirección IPv4 no válida.");
    }

    return (
        ((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3]
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
        throw new Error("Usa el formato 192.168.1.0/24");
    }

    const ip = parts[0];
    const prefix = Number(parts[1]);

    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
        throw new Error("El prefijo debe estar entre 0 y 32.");
    }

    const ipNumber = ipv4ToNumber(ip);

    // JavaScript bitwise operations are signed 32-bit.
    // >>> 0 converts the result back to an unsigned number.
    const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const network = (ipNumber & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;

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

document.getElementById("calculateIp").addEventListener("click", () => {
    const input = document.getElementById("ipInput");
    const result = document.getElementById("ipResult");

    try {
        const data = calculateNetwork(input.value);

        result.innerHTML = `
            <p><strong>Network:</strong> ${data.network}</p>
            <p><strong>Broadcast:</strong> ${data.broadcast}</p>
            <p><strong>First Host:</strong> ${data.firstHost}</p>
            <p><strong>Last Host:</strong> ${data.lastHost}</p>
            <p><strong>Hosts:</strong> ${data.hosts}</p>
        `;
    } catch (error) {
        showError(result, error.message);
    }
});

// ---------- Password Generator ----------

document.getElementById("generatePassword").addEventListener("click", () => {
    const lengthInput = document.getElementById("passwordLength");
    const result = document.getElementById("passwordResult");

    let length = Number(lengthInput.value);

    if (!Number.isInteger(length) || length < 4 || length > 128) {
        showError(result, "La longitud debe estar entre 4 y 128.");
        return;
    }

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";

    const values = new Uint32Array(length);
    crypto.getRandomValues(values);

    let password = "";

    for (let i = 0; i < length; i++) {
        password += characters[values[i] % characters.length];
    }

    result.textContent = password;
});

// ---------- JSON Formatter ----------

document.getElementById("formatJson").addEventListener("click", () => {
    const input = document.getElementById("jsonInput");
    const result = document.getElementById("jsonResult");

    try {
        const parsed = JSON.parse(input.value);
        result.textContent = JSON.stringify(parsed, null, 2);
    } catch {
        showError(result, "El contenido no es un JSON válido.");
    }
});

// ---------- Base64 ----------

function utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";

    bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary);
}

function base64ToUtf8(base64) {
    const binary = atob(base64.trim());
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

document.getElementById("encodeBase64").addEventListener("click", () => {
    const input = document.getElementById("base64Input");
    const result = document.getElementById("base64Result");

    try {
        result.textContent = utf8ToBase64(input.value);
    } catch {
        showError(result, "No se pudo codificar el texto.");
    }
});

document.getElementById("decodeBase64").addEventListener("click", () => {
    const input = document.getElementById("base64Input");
    const result = document.getElementById("base64Result");

    try {
        result.textContent = base64ToUtf8(input.value);
    } catch {
        showError(result, "El contenido no es un Base64 válido.");
    }
});

// ---------- JWT Decoder ----------

function decodeBase64Url(value) {
    let base64 = value.replace(/-/g, "+").replace(/_/g, "/");

    while (base64.length % 4) {
        base64 += "=";
    }

    return decodeURIComponent(
        atob(base64)
            .split("")
            .map(char => "%" + char.charCodeAt(0).toString(16).padStart(2, "0"))
            .join("")
    );
}

document.getElementById("decodeJwt").addEventListener("click", () => {
    const input = document.getElementById("jwtInput");
    const result = document.getElementById("jwtResult");

    try {
        const parts = input.value.trim().split(".");

        if (parts.length !== 3) {
            throw new Error("Un JWT debe tener tres partes separadas por puntos.");
        }

        const header = JSON.parse(decodeBase64Url(parts[0]));
        const payload = JSON.parse(decodeBase64Url(parts[1]));

        result.textContent = JSON.stringify(
            {
                header,
                payload,
                note: "Este decoder solo lee el JWT. No verifica su firma."
            },
            null,
            2
        );
    } catch (error) {
        result.textContent = `Error: ${error.message}`;
    }
});

// ---------- Number Converter ----------

document.getElementById("convertNumber").addEventListener("click", () => {
    const input = document.getElementById("numberInput");
    const result = document.getElementById("numberResult");

    const value = input.value.trim();

    if (!/^\d+$/.test(value)) {
        showError(result, "Introduce un número decimal entero positivo.");
        return;
    }

    const decimal = BigInt(value);

    result.innerHTML = `
        <p><strong>Decimal:</strong> ${decimal}</p>
        <p><strong>Hex:</strong> 0x${decimal.toString(16).toUpperCase()}</p>
        <p><strong>Binary:</strong> ${decimal.toString(2)}</p>
    `;
});

document.getElementById("clearNumber").addEventListener("click", () => {
    document.getElementById("numberInput").value = "";
    document.getElementById("numberResult").textContent = "";
});

// Generate an initial password so the card is useful immediately.
document.getElementById("generatePassword").click();
