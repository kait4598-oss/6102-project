import os
import uuid
from dataclasses import dataclass
from typing import Optional

import boto3


@dataclass(frozen=True)
class S3Location:
    bucket: str
    key: str


def get_s3_bucket_name() -> Optional[str]:
    name = os.getenv("S3_BUCKET_NAME")
    return name.strip() if name else None


def _get_region_name() -> Optional[str]:
    region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")
    return region.strip() if region else None


def get_s3_client():
    region = _get_region_name()
    if region:
        return boto3.client("s3", region_name=region)
    return boto3.client("s3")


def make_object_key(user_id: int, filename: str) -> str:
    safe_name = filename.replace("/", "_").replace("\\", "_")
    return f"uploads/user-{user_id}/{uuid.uuid4().hex}_{safe_name}"


def to_s3_url(bucket: str, key: str) -> str:
    return f"s3://{bucket}/{key}"


def parse_s3_url(value: str) -> Optional[S3Location]:
    if not value or not value.startswith("s3://"):
        return None
    no_scheme = value[len("s3://"):]
    parts = no_scheme.split("/", 1)
    if len(parts) != 2:
        return None
    bucket, key = parts[0], parts[1]
    if not bucket or not key:
        return None
    return S3Location(bucket=bucket, key=key)

