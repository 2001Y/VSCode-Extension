import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as moment from 'moment';
import * as nls from 'vscode-nls';

// nls設定を初期化
const localize = nls.loadMessageBundle();

// namingFormatsを設定から取得する関数
function getNamingFormats(): string[] {
    const config = vscode.workspace.getConfiguration('timestamp-file-folder');
    return config.get('namingFormats') as string[];
}

let namingFormats = getNamingFormats();

// フォーマットレベルを特定する関数を追加
function identifyFormatLevel(name: string): number {
	const formats = getNamingFormats();
	for (let i = 0; i < formats.length; i++) {
		const format = formats[i];
		if (moment(name, format, true).isValid()) {
			return i + 1;
		}
	}
	return 0; // フォーマットに一致しない場合
}

// 設定から拡張子を取得する関数を追加
function getDefaultFileExtension(): string {
    const config = vscode.workspace.getConfiguration('timestamp-file-folder');
    return config.get('defaultFileExtension') as string || '.txt';
}

// 拡張機能のアクティベーション関数を修正
export function activate(context: vscode.ExtensionContext) {

	['newTimestampFile', 'newTimestampFolder'].forEach(command => {
		context.subscriptions.push(
			vscode.commands.registerCommand(`timestamp-file-folder.${command}`, 
				(uri) => main(uri, command === 'newTimestampFile'))
		);
	});

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(event => {
			if (event.affectsConfiguration('timestamp-file-folder.namingFormats')) {
				namingFormats = getNamingFormats();
				vscode.window.showInformationMessage(localize('namingFormatChanged', "Naming format setting has been changed. It will be reflected in new names."));
			}
		})
	);
}

// 拡張機能の非アクティベーション関数
export function deactivate() {}

// メイン処理を行う関数
async function main(uri: vscode.Uri, isFile: boolean) {
	const uniquePath = await getUniquePath(uri.fsPath, isFile);
	if (isFile) {
		await fs.writeFile(uniquePath, '');
	} else {
		await fs.mkdir(uniquePath);
	}

	// 作成したファイル/フォルダのURIを取得
	const createdUri = vscode.Uri.file(uniquePath);
	// エクスプローラーで表示
	await vscode.commands.executeCommand('revealInExplorer', createdUri);
	// リストで選択
	vscode.commands.executeCommand('list.select', createdUri);
	// 親フォルダを展開
	vscode.commands.executeCommand('list.toggleExpand', vscode.Uri.file(path.dirname(uniquePath)));
}

// ユニークなパスを生する関数
async function getUniquePath(parentPath: string, isFile: boolean): Promise<string> {
	const formats = getNamingFormats();
	const maxFormatIndex = formats.length;
	let formatIndex = 0;

	const extension = isFile ? getDefaultFileExtension() : '';
	const generatePath = (format: string, counter = '') => {
		const formattedDate = moment().format(format);
		const fileName = `${formattedDate}${counter}${extension}`;
		return path.join(parentPath, fileName);
	};

	// 親フォルダのフォーマットレベルを特定
	const parentFolderName = path.basename(parentPath);
	const parentFormatLevel = identifyFormatLevel(parentFolderName);

	// 親フォルダのフォーマットレベルが有効な場合、次のレベルから開始
	if (parentFormatLevel > 0) {
		if( parentFormatLevel < maxFormatIndex) {
			formatIndex = parentFormatLevel;
		} else {
			formatIndex = maxFormatIndex - 1;
		}
	}

	let uniquePath: string = "";
	let duplicatePath: string | null = null;

	// フォーマットを順番に試す
	for (let i = formatIndex; i < maxFormatIndex; i++) {
		uniquePath = generatePath(formats[i]);
		duplicatePath = await findDuplicatePath(uniquePath);
		if (isFile && duplicatePath) {
			await updateExistingFileFormat(duplicatePath, i + 1);
		}
		// 重複するパスが見つからない場合、現在のフォーマットを使用
		if (!duplicatePath) {
			return uniquePath;
		}
	}

	// すべてのフォーマットを試しても重複がある場合、カウンターを追加
	let counter = 1;
	const maxFormat = formats[maxFormatIndex - 1];

	while (true) {
		const counterSuffix = `_${counter}`;
		uniquePath = generatePath(maxFormat, counterSuffix);
		
		const isDuplicate = await findDuplicatePath(uniquePath);
		if (!isDuplicate) {
			break;
		}
		
		counter++;
	}

	return uniquePath;
}

// 重複するパスを見つける関数
const pathVariations = {
	getAll: (fullPath: string): string[] => [
		fullPath,
		pathVariations.trimZeroSeconds(fullPath),
		pathVariations.addZeroSeconds(fullPath),
		pathVariations.addZeroCounter(fullPath),
		pathVariations.trimZeroCounter(fullPath)
	],
	trimZeroSeconds: (fullPath: string): string => {
		const parsed = path.parse(fullPath);
		
		return path.format({ ...parsed, name: parsed.name.replace(/:00$/, ''), base: '' });
	},
	addZeroSeconds: (fullPath: string): string => {
		const parsed = path.parse(fullPath);
		const newName = parsed.name.endsWith(':00') ? parsed.name : `${parsed.name}:00`;
		return path.format({ ...parsed, name: newName, base: '' });
	},
	addZeroCounter: (fullPath: string): string => {
		const parsed = path.parse(fullPath);
		const newName = parsed.name.endsWith('_0') ? parsed.name : `${parsed.name}_0`;
		return path.format({ ...parsed, name: newName, base: '' });
	},
	trimZeroCounter: (fullPath: string): string => {
		const parsed = path.parse(fullPath);
		return path.format({ ...parsed, name: parsed.name.replace(/_0$/, ''), base: '' });
	}
};
async function findDuplicatePath(fullPath: string): Promise<string | null> {
	const variations = pathVariations.getAll(fullPath);
	const parentDir = path.dirname(fullPath);
	const parentName = path.basename(parentDir);

	// 親フォルダ名との重複をチェック
	if (variations.some(v => path.basename(v) === parentName)) {
		return parentDir;
	}

	for (const variation of variations) {
		try {
			await fs.access(variation);
			return variation;
		} catch {
				// ファイルが存在しない場合は何もしない
		}
	}
	return null;
}

// 既存のファイル名のフォーマットを更新する関数
async function updateExistingFileFormat(existingPath: string, newFormatIndex: number): Promise<void> {
	try {
		const formats = getNamingFormats();
		const newFormat = formats[newFormatIndex];
		let updatedPath = existingPath;

		if (newFormat === formats[1]) {
			updatedPath = pathVariations.addZeroCounter(updatedPath);
		} else if (newFormat === formats[2]) {
			updatedPath = pathVariations.addZeroSeconds(updatedPath);
		}

		if (updatedPath !== existingPath) {
			try {
				await fs.rename(existingPath, updatedPath);
			} catch (renameError) {
				throw new Error(localize('fileRenameError', "Failed to rename file: ") + (renameError instanceof Error ? renameError.message : String(renameError)));
			}
		}
	} catch (error) {
		vscode.window.showErrorMessage(localize('errorOccurred', "An error occurred: ") + (error instanceof Error ? error.message : String(error)));
	}
}
