# ===============================
# CONFIGURAÇÃO AUTOMÁTICA REACT NATIVE ENV
# ===============================

# Variáveis de caminhos
$jdkUrl = "https://github.com/adoptium/temurin20-binaries/releases/download/jdk-20.0.2+9/OpenJDK20U-jdk_x64_windows_hotspot_20.0.2_9.msi"
$jdkInstaller = "$env:TEMP\OpenJDK20.msi"
$jdkInstallPath = "C:\Program Files\Adoptium\jdk-20.0.2"

$androidSdkPath = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"

# ===============================
# 1️⃣ Baixar e instalar JDK 20
# ===============================
Write-Host "Baixando JDK 20..."
Invoke-WebRequest -Uri $jdkUrl -OutFile $jdkInstaller

Write-Host "Instalando JDK 20..."
Start-Process msiexec.exe -Wait -ArgumentList "/i `"$jdkInstaller`" INSTALLDIR=`"$jdkInstallPath`" /qn"

# ===============================
# 2️⃣ Configurar JAVA_HOME
# ===============================
Write-Host "Configurando JAVA_HOME..."
setx JAVA_HOME "$jdkInstallPath"
$env:JAVA_HOME = $jdkInstallPath
$env:PATH = "$jdkInstallPath\bin;$env:PATH"

# ===============================
# 3️⃣ Configurar ANDROID_HOME
# ===============================
Write-Host "Configurando ANDROID_HOME..."
setx ANDROID_HOME "$androidSdkPath"
$env:ANDROID_HOME = $androidSdkPath
$env:PATH = "$androidSdkPath\platform-tools;$androidSdkPath\tools;$androidSdkPath\tools\bin;$env:PATH"

# ===============================
# 4️⃣ Verificação de versões
# ===============================
Write-Host "Verificando instalações..."
java -version
adb version

Write-Host "Configuração concluída! Abra um novo terminal antes de usar o React Native."
