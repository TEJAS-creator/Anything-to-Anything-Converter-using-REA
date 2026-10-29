"""
Archive Engine:
ZIP, TAR, TAR.GZ creation and extraction.
"""

import os
import zipfile
import tarfile
import gzip
import shutil


def create_archive(files: list[str], output_path: str, format_type: str = 'zip') -> str:
    """Creates a ZIP, TAR, or TAR.GZ archive containing the specified files."""
    fmt = format_type.lower()

    if fmt == 'zip':
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for f in files:
                zf.write(f, arcname=os.path.basename(f))

    elif fmt in ('tar', 'tar.gz', 'tgz', 'gz'):
        mode = 'w:gz' if 'gz' in fmt else 'w'
        with tarfile.open(output_path, mode) as tf:
            for f in files:
                tf.add(f, arcname=os.path.basename(f))

    return output_path


def extract_archive(archive_path: str, output_dir: str) -> list[str]:
    """Extracts an archive and returns list of extracted file paths."""
    os.makedirs(output_dir, exist_ok=True)
    extracted = []

    if zipfile.is_zipfile(archive_path):
        with zipfile.ZipFile(archive_path, 'r') as zf:
            zf.extractall(output_dir)
            extracted = [os.path.join(output_dir, name) for name in zf.namelist()]

    elif tarfile.is_tarfile(archive_path):
        with tarfile.open(archive_path, 'r:*') as tf:
            tf.extractall(output_dir)
            extracted = [os.path.join(output_dir, member.name) for member in tf.getmembers()]

    elif archive_path.endswith('.gz'):
        out_file = os.path.join(output_dir, os.path.basename(archive_path)[:-3])
        with gzip.open(archive_path, 'rb') as f_in:
            with open(out_file, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        extracted.append(out_file)

    return extracted
