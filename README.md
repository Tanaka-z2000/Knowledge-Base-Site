# Knowledge Base Site

公開知識圖書館，將研究與查核整理成完整作品，以圖解、章節導覽與可追溯來源協助理解。館藏依內容主題與作品形式組織，可持續加入不同領域。

目前首份作品是「臺灣最低工資：從薪資下限到生活改善」。原六份研究筆記保留為證據詳情；既有研究限制不因重新編輯而消失。

[首頁](index.html) · [全部館藏](collection.html) · [探索主題](explore.html) · [首份作品](work-taiwan-minimum-wage.html) · [來源資料庫](sources.html)

網站網址：https://tanaka-z2000.github.io/Knowledge-Base-Site/

## GitHub Pages設定

Pages已啟用；[首次部署紀錄](https://github.com/Tanaka-z2000/Knowledge-Base-Site/actions/runs/37732227572)確認建置與部署成功。main根目錄的靜態HTML包含.nojekyll，後續push會觸發更新，不必每次手動Save。既有設定如下：

1. Source：Deploy from a branch。
2. Branch：main，資料夾：/(root)。
3. Save，等待GitHub部署成功後開啟上述網址。

[開啟Pages設定](https://github.com/Tanaka-z2000/Knowledge-Base-Site/settings/pages)。使用免費GitHub Pages與預設網址；每次更新仍須分別核對push、[部署紀錄](https://github.com/Tanaka-z2000/Knowledge-Base-Site/actions)與實際閱讀。部署成功不代表每種瀏覽器均已驗證。

## 更新與邊界

本庫只保存已核准、經檢查的公開成品及維護文件。文章、搜尋與來源預覽共用同一批公開內容；沒有登入或資料蒐集功能，不包含原始研究附件、私人原話與未公開筆記。

更新由Agent在已授權工作環境篩選、建置及檢查，再commit、push本庫main；本庫不持有私人庫憑證，也不從其他程式庫拉取資料。public-files.json只列受管理成品，避免更新時清空維護文件。不要手改衍生HTML作為永久正文，應從主要Markdown重新產生。

維護前閱讀[AGENTS](AGENTS.md)。不新增外部託管、付費服務、會員或API整合。

公開提交前，維護端會以當次核准資料重新建置，核對整個Git暫存區的檔案與內容。手改成品、額外檔案、撤下頁面殘留或未審閱維護文件會停止發布；此程序不取代公開授權與人工內容查核。
