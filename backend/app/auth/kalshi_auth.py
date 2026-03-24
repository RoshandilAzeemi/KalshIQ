"""Kalshi API RSA-PSS authentication module.

Implements request signing per Kalshi's API specification.
Uses RSA-PSS with SHA-256 for signing the request timestamp,
HTTP method, and request path.

Security Notes:
    - Private keys are loaded from a file path specified via env var.
    - No secrets are ever logged or exposed in responses.
    - The private key is loaded once and cached in memory.
"""

import base64
import hashlib
import logging
import time
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa

from app.config import settings

logger = logging.getLogger(__name__)

_private_key: rsa.RSAPrivateKey | None = None


def _load_private_key() -> rsa.RSAPrivateKey | None:
    """Load the RSA private key from the configured file path.

    Returns:
        The loaded RSA private key, or None if the path is not configured
        or the file cannot be read.
    """
    global _private_key
    if _private_key is not None:
        return _private_key

    key_path = settings.kalshi_private_key_path
    if not key_path:
        logger.warning("KALSHI_PRIVATE_KEY_PATH is not configured.")
        return None

    path = Path(key_path)
    if not path.exists():
        logger.error("Private key file not found: %s", key_path)
        return None

    try:
        key_data = path.read_bytes()
        loaded_key = serialization.load_pem_private_key(key_data, password=None)
        if not isinstance(loaded_key, rsa.RSAPrivateKey):
            logger.error("Key is not an RSA private key.")
            return None
        _private_key = loaded_key
        logger.info("RSA private key loaded successfully.")
        return _private_key
    except Exception:
        logger.exception("Failed to load private key.")
        return None


def sign_request(
    method: str,
    path: str,
    body: str = "",
) -> dict[str, str]:
    """Sign a Kalshi API request using RSA-PSS.

    Constructs the signing payload from the current timestamp, HTTP method,
    and request path, then signs it with the RSA private key.

    Args:
        method: HTTP method (GET, POST, etc.).
        path: Request path (e.g., /trade-api/v2/markets).
        body: Request body string (empty for GET requests).

    Returns:
        Dictionary of headers to include in the request:
        - KALSHI-ACCESS-KEY: The API key ID.
        - KALSHI-ACCESS-SIGNATURE: Base64-encoded RSA-PSS signature.
        - KALSHI-ACCESS-TIMESTAMP: Unix timestamp string.

    Raises:
        RuntimeError: If the private key is not available.
    """
    private_key = _load_private_key()
    if private_key is None:
        raise RuntimeError(
            "Cannot sign request: RSA private key is not available. "
            "Check KALSHI_PRIVATE_KEY_PATH configuration."
        )

    timestamp_ms = str(int(time.time() * 1000))

    # Construct the message to sign: timestamp + method + path
    message = f"{timestamp_ms}{method.upper()}{path}"
    if body:
        message += body

    message_bytes = message.encode("utf-8")
    message_hash = hashlib.sha256(message_bytes).digest()

    signature = private_key.sign(
        message_hash,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH,
        ),
        hashes.SHA256(),
    )

    encoded_signature = base64.b64encode(signature).decode("utf-8")

    return {
        "KALSHI-ACCESS-KEY": settings.kalshi_api_key_id,
        "KALSHI-ACCESS-SIGNATURE": encoded_signature,
        "KALSHI-ACCESS-TIMESTAMP": timestamp_ms,
        "Content-Type": "application/json",
    }
