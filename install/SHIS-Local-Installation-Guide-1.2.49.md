# SHIS Local 校園健康資訊系統完整安裝手冊

版本：1.2.49  
適用環境：64 位元 Windows 10 1809 以上或 Windows 11  
預設網站連接埠：TCP 3000  
設計者：Qingxi Elementary School - Gavin Huang

## 1. 部署方式

SHIS Local 採校內主從使用方式：

- 健康中心主機安裝網站、API、PostgreSQL 及 Windows 服務。
- 健康中心主機可使用 `http://localhost:3000/`。
- 其他校內電腦只使用瀏覽器連到健康中心主機，例如 `http://192.168.0.100:3000/`。
- PostgreSQL 只監聽主機的 `127.0.0.1`，不得從其他電腦直接連線。
- Windows 防火牆只開放本機子網路連入 TCP 3000，不應將此連接埠轉送到網際網路。

目前 1.2.49 安裝版使用校內 HTTP，尚未自動建立 HTTPS 憑證。因此只能部署於受管理、可信任且不對外公開的校內網路；正式處理健康資料前，建議另行完成內網 HTTPS。

## 2. 安裝前準備

### 2.1 主機需求

- 64 位元 Windows 10 1809 以上或 Windows 11。
- 具本機系統管理員權限的 Windows 帳號。
- 建議至少 4 GB 可用磁碟空間；資料與備份增加後需保留更多空間。
- 健康中心主機不可進入長時間睡眠，且應使用穩定有線網路。
- TCP 3000 不可被其他程式占用。
- 主機與使用端電腦需位於同一校內網段，或網路設備已允許兩者互通。

安裝程式已包含私有 Node.js、PostgreSQL 17 與 Windows 服務元件，不必另外安裝 Node.js、PostgreSQL、IIS、XAMPP 或 Docker。

### 2.2 準備資料

安裝前先準備：

- 學校名稱。
- 學校代碼，建議使用學校既有代碼，只使用英文字母、數字、底線或連字號。
- 正式管理員姓名與密碼。
- 正式護理師姓名與密碼。
- 初始學年度及學期。
- 學生名冊 `.xls`、`.xlsx` 或 `.csv`；可在初始化後再匯入。
- 備份儲存位置，例如 NAS 專用資料夾或加密外接硬碟。

管理員與護理師應使用不同帳號。密碼至少 12 個字元，並包含英文大寫、英文小寫、數字及符號。

### 2.3 固定主機 IP

建議由學校網管在 DHCP 伺服器或路由器上，依健康中心主機網卡 MAC 位址保留固定 IP。若使用 `192.168.0.100`，後續其他電腦的網址就是：

```text
http://192.168.0.100:3000/
```

安裝程式會偵測目前 IP，但不會修改 Windows 網卡或校內 DHCP 設定。IP 若改變，其他電腦使用的網址也會改變。

## 3. 驗證安裝檔

交付檔案應包含：

```text
SHIS-Local-Setup-1.2.49-x64.exe
SHIS-Local-Setup-1.2.49-x64.exe.sha256.txt
SHIS-Local-Installation-Guide-1.2.49.md
```

在安裝檔所在資料夾開啟 PowerShell，執行：

```powershell
Get-FileHash .\SHIS-Local-Setup-1.2.49-x64.exe -Algorithm SHA256
Get-Content .\SHIS-Local-Setup-1.2.49-x64.exe.sha256.txt
```

兩個 SHA-256 必須完全相同。若不同，不可執行該檔案，應重新向正式發布來源取得。

目前安裝程式尚未使用商業 Authenticode 憑證。若 Windows 顯示未知發行者或 SmartScreen 警告，只有在檔案來源、檔名及 SHA-256 均經學校管理員確認後才可繼續；不可停用整台電腦的 SmartScreen。

## 4. 執行全自動安裝

1. 先關閉舊版 SHIS Local 瀏覽器分頁，但不要刪除 `C:\ProgramData\SHIS Local`。
2. 雙擊 `SHIS-Local-Setup-1.2.49-x64.exe`。
3. Windows 顯示 UAC 時，確認程式來源後選擇允許。
4. 閱讀版權內容並繼續。
5. 建議保留預設程式目錄：

   ```text
   C:\Program Files\SHIS Local
   ```

6. 按下安裝。程式會自動完成：

   - 解壓網站、API、Node.js 與 PostgreSQL。
   - 在 `C:\ProgramData\SHIS Local` 建立資料與設定目錄。
   - 初始化只允許本機連線的 PostgreSQL。
   - 建立限制權限的資料庫帳號。
   - 執行版本化資料庫 migration。
   - 安裝並啟動四個 Windows 服務。
   - 建立只允許 `LocalSubnet` 連入的 TCP 3000 防火牆規則。
   - 執行網站與資料庫健康檢查。

7. 安裝完成後會開啟網站及「連線資訊」文字檔。
8. 不可公開或傳送連線資訊中的一次性初始化金鑰。

安裝時間依硬碟速度約需數分鐘。安裝過程不可關機或強制結束安裝程式。

## 5. 安裝後的目錄與服務

### 5.1 程式目錄

```text
C:\Program Files\SHIS Local
```

存放網站、API、更新器、私有執行環境與 PostgreSQL 程式。系統更新可以替換此處的程式檔。

### 5.2 正式資料目錄

```text
C:\ProgramData\SHIS Local
```

包含：

```text
backups\          PostgreSQL 自動備份
config\           資料庫密碼、系統密鑰與環境設定
database\         PostgreSQL 正式資料庫
logs\             安裝、服務及更新紀錄
updates\          已驗證更新包、更新狀態及舊程式回復檔
connection-info.txt  連線網址與一次性初始化金鑰
```

不可用檔案總管手動修改、搬移或刪除 `config`、`database`。這些資料不會因一般程式更新或解除安裝而自動刪除。

### 5.3 Windows 服務

- `SHISLocalPostgreSQL`
- `SHISLocalWeb`
- `SHISLocalApi`
- `SHISLocalGateway`

四個服務都應顯示為「執行中」，啟動類型應為「自動」。PostgreSQL 會先啟動，網站、API 與 Gateway 採延遲自動啟動，避免 Windows 剛開機時網路與資料庫尚未就緒。

主機開機後不需要先登入 Windows，系統服務就會在背景自動執行。等待約 1 至 2 分鐘後，校內其他電腦即可使用固定 IP 連線。Gateway 對校內提供 TCP 3000；Web、API 與 PostgreSQL 只在主機內部使用。

## 6. 首次系統初始化

1. 在健康中心主機開啟 `http://localhost:3000/`。
2. 確認畫面顯示「正式系統初始化」。
3. 輸入學校名稱與學校代碼。
4. 設定管理員帳號、姓名、密碼及第二次密碼確認。
5. 設定護理師帳號、姓名、密碼及第二次密碼確認。
6. 從 `C:\ProgramData\SHIS Local\connection-info.txt` 取得一次性初始化金鑰並輸入。
7. 確認初始學期：

   - 每年 8 月 1 日開始新學年度第一學期。
   - 每年 2 月 1 日開始該學年度第二學期。

8. 學生名冊可選擇立即匯入，也可略過後登入再匯入。
9. 按「預覽系統初始化」，檢查學校、帳號、學期及名冊摘要。
10. 確認後建立正式系統。系統會建立首次 PostgreSQL 備份。
11. 使用管理員或護理師帳號登入。

一次性初始化只能成功執行一次。初始化完成後，即使有人取得原金鑰也不能再次重建系統。

## 7. 匯入第一份學生名冊

1. 以具匯入權限的帳號登入。
2. 開啟「資料匯入匯出 → 學生名冊匯入」。
3. 選擇目標學期。
4. 可先下載「網站 17 欄範例」確認欄位格式。
5. 選擇 `.xls`、`.xlsx` 或 `.csv` 名冊。
6. 確認系統辨識的姓名、學號、年級、班級、座號、身分證及生日。
7. 檢查新增、更新、錯誤、缺漏及新名冊未出現學生。
8. 所有錯誤修正後重新選檔檢核。
9. 輸入本人密碼，才可正式提交整批名冊。
10. 若要啟用跨班感染關聯分析，由管理員開啟「系統管理 → 學校基本設定 → 感染關聯班級設定」，依實際情況設定相鄰班級、共用空間或共同活動群組。未設定時仍會執行同班與可能的校內兄弟姊妹關聯分析。

系統使用身分證或居留證號的安全查詢雜湊辨識同一位學生。學號、年級、班級與座號屬學期編班資料，可每學期更新；傷病及健康歷史不會因重新匯入而刪除。

## 8. 第二台電腦連線

1. 在主機開啟：

   ```text
   C:\ProgramData\SHIS Local\connection-info.txt
   ```

2. 找到 `LAN URL`，例如 `http://192.168.0.100:3000/`。
3. 在第二台校內電腦的 Edge、Chrome 或 Firefox 輸入完整網址。
4. 確認出現登入畫面，再以個人帳號登入。

若無法連線：

```powershell
Test-NetConnection 192.168.0.100 -Port 3000
```

`TcpTestSucceeded` 應為 `True`。若為 `False`，依序確認：

- 主機是否開機且未睡眠。
- 第二台電腦與主機是否在可互通的校內網段。
- 使用的 IP 是否仍為主機目前 IP。
- 四個 SHIS Local 服務是否正在執行。
- Windows 防火牆是否存在 `SHIS Local Web (TCP 3000)`。
- 校內交換器、VLAN 或端點防護軟體是否阻擋 TCP 3000。

## 9. 系統健康檢查

可從 Windows 開始功能表執行「SHIS Local 系統檢查」，或以系統管理員 PowerShell 執行：

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Program Files\SHIS Local\installer\Test-ShisInstallation.ps1" -Port 3000
```

正常結果應包括：

- `listening: true`
- `health: true`
- 四個服務均為 `Running`
- 四個服務的 `startupTypes` 均為 `Auto`
- `addresses` 列出主機可使用的內網網址

也可開啟：

```text
http://localhost:3000/api/health
```

只要看到 `status` 為 `ok`、`database` 為 `connected`，代表網站 API 與資料庫可正常連線。

## 10. 正式備份

### 10.1 操作介面備份

1. 以管理員登入。
2. 開啟「資料匯入匯出 → 資料備份與還原」。
3. 選擇學生傷病、學生資料、重大傷病資料及系統設定。
4. 輸入本人密碼後建立備份。
5. 將下載的 `.json` 存到受控 NAS 或加密外接硬碟。
6. 不可只留在健康中心主機的下載資料夾。

### 10.2 自動 PostgreSQL 備份

完整安裝程式升級與網站更新前，系統會在下列位置建立 PostgreSQL custom-format 備份：

```text
C:\ProgramData\SHIS Local\backups
```

更新器會以 `pg_restore --list` 驗證備份可讀後才替換程式。仍應定期將備份複製到另一個實體裝置；同一顆硬碟上的備份無法防止硬碟故障。

## 11. 系統更新

### 11.1 更新前

1. 確認所有使用者已登出並完成手邊登錄。
2. 確認 `C:\ProgramData\SHIS Local\backups` 有足夠空間。
3. 建議先從「資料備份與還原」下載完整 JSON 備份。
4. 更新檔只能從正式發布來源取得，副檔名為 `.shisupdate`。

正式更新檔採「累積更新」。只要目前版本為 `1.2.1` 以上，可直接上傳最新版，不必依序安裝中間版本。版本早於 `1.2.1`，或畫面顯示安全更新元件不完整時，請先執行最新版完整安裝程式一次；既有 `C:\ProgramData\SHIS Local` 資料仍會保留。

### 11.2 套用更新

1. 以管理員登入。
2. 開啟「系統管理 → 系統更新」。
3. 按「選擇更新檔」並上傳 `.shisupdate`。
4. 系統會驗證設計者簽章、版本、最低相容版本及每個檔案 SHA-256。累積更新會依資料庫紀錄只執行尚未套用的 migration。
5. 確認更新說明與檔案數量。
6. 按「套用更新」，再次輸入本人密碼。
7. 更新期間網站會暫時中斷；不可關機。
8. 服務恢復後重新整理並登入。
9. 在更新紀錄確認狀態為「已完成」，並確認新版本號。

更新包只可替換 `web`、`api`、`installer` 與版權檔，不可包含正式資料庫、帳號或設定。資料表調整只執行有版本與雜湊紀錄的 migration。若更新失敗，更新器會嘗試回復舊程式，並保留更新前資料庫備份與錯誤紀錄。

完整安裝檔 `.exe` 適合新主機安裝或以原安裝目錄升級；`.shisupdate` 適合既有系統從網頁上傳更新。兩種方式都不得手動覆蓋 `C:\ProgramData\SHIS Local`。

## 12. 重新安裝與完整安裝版升級

執行相同 AppId 的新版完整安裝程式時：

1. 安裝程式先停止 SHIS Local 服務。
2. 偵測既有 `C:\ProgramData\SHIS Local\database`。
3. 保留既有資料庫、設定、密鑰與帳號。
4. 建立 `pre-upgrade-*.backup`。
5. 套用新 migration 並重新安裝服務。
6. 完成健康檢查後恢復網站。

升級前不可刪除 `C:\ProgramData\SHIS Local`。若設定檔遺失，系統不會猜測或重建既有資料庫密碼，需從正式備份復原。

## 13. 解除安裝

可從 Windows「已安裝的應用程式」解除安裝 SHIS Local。解除安裝會：

- 停止並移除 SHIS Local Windows 服務。
- 移除 TCP 3000 防火牆規則。
- 移除 `C:\Program Files\SHIS Local` 程式檔。
- 保留 `C:\ProgramData\SHIS Local` 的資料庫、設定、備份及紀錄，以供重新安裝或資料救援。

若學校確定永久停用，應先建立並驗證備份，再由資訊管理人員依個資銷毀程序處理 `C:\ProgramData\SHIS Local`。不可在未確認備份前直接刪除。

## 14. 常見故障排除

### 14.1 安裝失敗

查看：

```text
C:\ProgramData\SHIS Local\logs\install.log
```

常見原因包括 TCP 3000 已占用、端點防護阻止服務建立、磁碟空間不足或安裝過程被中斷。

查詢連接埠：

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000
```

### 14.2 localhost 可開啟但 IP 不可開啟

確認 Gateway 是否監聽全部內網介面：

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000
```

`LocalAddress` 正常應為 `0.0.0.0`。再確認防火牆：

```powershell
Get-NetFirewallRule -DisplayName "SHIS Local Web (TCP 3000)"
```

### 14.3 網站顯示服務啟動中

稍候 30 至 60 秒再重新整理。若持續出現，執行「SHIS Local 系統檢查」，並查看：

```text
C:\ProgramData\SHIS Local\logs
```

### 14.4 更新失敗

查看：

```text
C:\ProgramData\SHIS Local\logs\update.log
C:\ProgramData\SHIS Local\updates\update-status.json
C:\ProgramData\SHIS Local\backups\pre-update-*.backup
```

不要重複上傳來源不明的更新包，也不要手動覆蓋 `Program Files`。先確認系統是否已回復舊版，再由設計者依更新紀錄修正。

## 15. 上線前檢查表

- [ ] 健康中心主機已設定固定 IP 或 DHCP 保留。
- [ ] 四個 Windows 服務均為執行中。
- [ ] `http://localhost:3000/api/health` 顯示正常。
- [ ] 第二台電腦可連到主機 TCP 3000。
- [ ] 管理員與護理師使用不同帳號及強密碼。
- [ ] 一次性初始化金鑰未外洩。
- [ ] 已正確設定學校名稱、代碼與目前學期。
- [ ] 學生名冊經完整預覽後才正式匯入。
- [ ] 已測試建立及匯入備份。
- [ ] 備份另存於 NAS 或加密外接硬碟。
- [ ] 主機未對網際網路公開 TCP 3000。
- [ ] 已安排 Windows 更新、防毒與定期備份作業時間。
- [ ] 已完成內網 HTTPS 或接受僅在隔離可信網路使用 HTTP 的風險。

## 16. 發行檔校驗原則

每個 `.exe` 與 `.shisupdate` 都必須附帶同名的 `.sha256.txt`。即使版本號相同，只要重新建置，SHA-256 也可能不同；安裝或更新前一律以同一批正式交付檔案附帶的校驗檔為準，不可使用舊手冊、通訊軟體訊息或其他版本的雜湊值。
