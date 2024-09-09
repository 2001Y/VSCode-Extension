# TimeStamp File/Folder

TimeStamp File/Folder is an extension for adding time-stamped files and folders.

It supports multiple configurable naming formats and applies them according to priority. It automatically resolves conflicts with existing file/folder names and generates unique names using more detailed time stamp formats or sequential numbers where necessary.

## Key features.

1. creation of timestamped files/folders
2. customisable naming format
3. conflict avoidance with existing file/folder names

## Usage.

1. right-click in the Explorer pane and select ‘New file (with time stamp)’ or ‘New folder (with time stamp)’ from the context menu.
2. a file or folder with a name containing the current date and time will be created based on the selected format.

## Settings.

In the extension's settings, you can customise the following options:

- `timestamp-file-folder.namingFormats`: specifies the naming formats for timestamps in order of priority. Default values are:
  ```json.
  [
    ‘YYYYY-MM-DD’,.
    ‘YYYYY-MM-DD_HH:mm’,.
    ‘YYYYY-MM-DD_HH:mm:ss’
  ]
  ```

- `timestamp-file-folder.defaultFileExtension`: specifies the default file extension when creating a new file. The default value is `.txt`.

The format follows [Moment.js format](https://momentjs.com/docs/#/displaying/format/).

## Features.

- **Flexible naming conventions**: multiple formats can be specified and if there is a conflict with an existing file/folder name, the following detailed format is used.
- **Conflict Avoidance**: sequential numbers are automatically appended in the event of a conflict for all formats.
- **Consistency with parent folder**: if the parent folder uses a particular format, the new file/folder will start with the next level of formatting.
- **Updating existing files**: if a file with the same name exists, it is automatically updated to a more detailed format.

----

# TimeStamp File/Folder

TimeStamp File/Folderは、タイムスタンプ付きのファイルとフォルダを追加するための拡張機能です。

複数の設定可能な命名フォーマットをサポートし、優先度に従って適用します。既存のファイル/フォルダ名との競合を自動的に解決し、必要に応じてより詳細なタイムスタンプフォーマットや連番を使用してユニークな名前を生成します。

## 主な機能

1. タイムスタンプ付きファイル/フォルダの作成
2. カスタマイズ可能な命名フォーマット
3. 既存のファイル/フォルダ名との競合回避

## 使い方

1. エクスプローラーペインで右クリックし、コンテキストメニューから「新規ファイル（タイムスタンプ付き）」または「新規フォルダ（タイムスタンプ付き）」を選択します。
2. 選択したフォーマットに基づいて、現在の日時を含む名前のファイルまたはフォルダが作成されます。

## 設定

拡張機能の設定で、以下のオプションをカス��マイズできます：

- `timestamp-file-folder.namingFormats`: タイムスタンプの命名フォーマットを優先度順に指定します。デフォルト値は以下の通りです：
  ```json
  [
    "YYYY-MM-DD",
    "YYYY-MM-DD_HH:mm",
    "YYYY-MM-DD_HH:mm:ss"
  ]
  ```

- `timestamp-file-folder.defaultFileExtension`: 新規ファイル作成時のデフォルトの拡張子を指定します。デフォルト値は `.txt` です。

フォーマットは [Moment.js の書式](https://momentjs.com/docs/#/displaying/format/) に従います。

## 特徴

- **柔軟命名規則**: 複数のフォーマットを指定でき、既存のファイル/フォルダ名と競合した場合、次の詳細なフォーマットが使用されます。
- **競合回避**: すべてのフォーマットで競合が発生した場合、連番が自動的に付加されます。
- **親フォルダとの整合性**: 親フォルダが特定のフォーマットを使用している場合、新しいファイル/フォルダは次のレベルのフォーマットから開始します。
- **既存ファイルの更新**: 同名のファイルが存在する場合、より詳細なフォーマットに自動的に更新されます。