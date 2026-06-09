from cryptography.fernet import Fernet
from app.config import settings


def get_fernet() -> Fernet:
    if not settings.ENCRYPTION_SECRET_KEY:
        raise RuntimeError("ENCRYPTION_SECRET_KEY is missing in .env")
    return Fernet(settings.ENCRYPTION_SECRET_KEY.encode())


def encrypt_text(value: str) -> str:
    return get_fernet().encrypt(value.encode()).decode()


def decrypt_text(value: str) -> str:
    return get_fernet().decrypt(value.encode()).decode()