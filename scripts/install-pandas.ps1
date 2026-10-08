# pandas 설치 스크립트 (Windows PowerShell)
# 기본 pip 설치가 실패하면 대체 방법을 순서대로 시도합니다.
# 사용법: powershell -ExecutionPolicy Bypass -File scripts\install-pandas.ps1

$ErrorActionPreference = "Continue"

# Python 실행 파일 찾기 (py 런처 우선 — Microsoft Store 가짜 python.exe 회피)
$py = $null
foreach ($c in @("py", "python", "python3")) {
    if (Get-Command $c -ErrorAction SilentlyContinue) {
        & $c -c "import sys" 2>$null
        if ($LASTEXITCODE -eq 0) { $py = $c; break }
    }
}
if (-not $py) {
    Write-Host "[실패] Python을 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "  winget install Python.Python.3.12  또는 https://www.python.org 에서 설치하세요."
    Write-Host "  (설치 시 'Add python.exe to PATH' 체크)"
    exit 1
}

function Test-Pandas {
    & $py -c "import pandas; print('pandas', pandas.__version__, '설치 확인')" 2>$null
    return ($LASTEXITCODE -eq 0)
}

function Try-Step($name, [scriptblock]$cmd) {
    Write-Host ""
    Write-Host "==> 시도: $name" -ForegroundColor Cyan
    & $cmd
    if ($LASTEXITCODE -eq 0 -and (Test-Pandas)) { exit 0 }
}

if (Test-Pandas) { exit 0 }

Try-Step "pip 기본 설치"               { & $py -m pip install pandas }
Try-Step "pip 사용자 영역(--user) 설치" { & $py -m pip install --user pandas }
Try-Step "pip/setuptools/wheel 업그레이드 후 재시도" {
    & $py -m pip install --upgrade pip setuptools wheel
    & $py -m pip install pandas
}
Try-Step "미리 빌드된 wheel만 사용(소스 빌드 회피)" { & $py -m pip install --only-binary=:all: pandas }
Try-Step "국내 미러(카카오) 사용" {
    & $py -m pip install -i https://mirror.kakao.com/pypi/simple --trusted-host mirror.kakao.com pandas
}
Try-Step "pip 캐시 무시 + 타임아웃 연장" { & $py -m pip install --no-cache-dir --default-timeout=120 pandas }

if (Get-Command uv -ErrorAction SilentlyContinue) {
    Try-Step "uv 로 설치" { uv pip install --system pandas }
}
if (Get-Command conda -ErrorAction SilentlyContinue) {
    Try-Step "conda 로 설치" { conda install -y pandas }
}

Write-Host ""
Write-Host "[실패] 모든 방법이 실패했습니다. 다음을 확인하세요." -ForegroundColor Red
Write-Host "  - 64비트 Python 3.10 이상인지: $py -c `"import sys, struct; print(sys.version, struct.calcsize('P')*8, 'bit')`""
Write-Host "  - OneDrive 폴더 안의 가상환경은 동기화 때문에 깨질 수 있습니다. C:\venv 등 OneDrive 밖에 만드세요."
Write-Host "  - 회사/학교 네트워크라면 프록시: $py -m pip install --proxy http://주소:포트 pandas"
Write-Host "  - 'Microsoft Visual C++ 14.0 is required' 오류: Python을 최신 버전으로 올리면 wheel로 설치됩니다."
exit 1
