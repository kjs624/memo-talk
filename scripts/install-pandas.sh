#!/usr/bin/env bash
# pandas 설치 스크립트 (macOS / Linux)
# 기본 pip 설치가 실패하면 대체 방법을 순서대로 시도합니다.
# 사용법: bash scripts/install-pandas.sh

PY="${PYTHON:-}"
if [ -z "$PY" ]; then
  for c in python3 python; do
    if command -v "$c" >/dev/null 2>&1; then PY="$c"; break; fi
  done
fi
if [ -z "$PY" ]; then
  echo "[실패] Python을 찾을 수 없습니다. https://www.python.org 에서 설치하세요." >&2
  exit 1
fi

check() { "$PY" -c "import pandas; print('pandas', pandas.__version__, '설치 확인')" 2>/dev/null; }

try() {
  echo ""
  echo "==> 시도: $1"
  shift
  "$@" && check
}

if check; then exit 0; fi

try "pip 기본 설치"                 "$PY" -m pip install pandas && exit 0
try "pip 사용자 영역(--user) 설치"   "$PY" -m pip install --user pandas && exit 0
try "pip/setuptools/wheel 업그레이드 후 재시도" \
  sh -c "\"$PY\" -m pip install --upgrade pip setuptools wheel && \"$PY\" -m pip install pandas" && exit 0
try "미리 빌드된 wheel만 사용(소스 빌드 회피)" \
  "$PY" -m pip install --only-binary=:all: pandas && exit 0
try "국내 미러(카카오) 사용" \
  "$PY" -m pip install -i https://mirror.kakao.com/pypi/simple --trusted-host mirror.kakao.com pandas && exit 0
try "pip 캐시 무시 + 타임아웃 연장" \
  "$PY" -m pip install --no-cache-dir --default-timeout=120 pandas && exit 0
try "시스템 패키지 보호(PEP 668) 우회" \
  "$PY" -m pip install --user --break-system-packages pandas && exit 0

if command -v uv >/dev/null 2>&1; then
  try "uv 로 설치" uv pip install --system --python "$PY" pandas && exit 0
fi
if command -v conda >/dev/null 2>&1; then
  try "conda 로 설치" conda install -y pandas && exit 0
fi
if command -v apt-get >/dev/null 2>&1; then
  try "apt 로 설치(python3-pandas)" sudo apt-get install -y python3-pandas && exit 0
fi
if command -v brew >/dev/null 2>&1; then
  try "Homebrew 로 설치" brew install python-pandas 2>/dev/null && exit 0
fi

cat >&2 <<'MSG'

[실패] 모든 방법이 실패했습니다. 다음을 확인하세요.
  - Python 버전: pandas 최신 버전은 64비트 Python 3.10 이상이 필요합니다.
  - 회사/학교 네트워크라면 프록시 설정: pip install --proxy http://주소:포트 pandas
  - 가상환경을 새로 만들어 시도: python3 -m venv .venv && . .venv/bin/activate && pip install pandas
MSG
exit 1
