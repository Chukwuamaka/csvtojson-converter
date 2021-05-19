// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "csv-json" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json

	// Implementation of the CSV to JSON conversion
	let toJSON = vscode.commands.registerCommand('csv.toJSON', function () {
		const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
		const folderPath = filePath.split("\\").slice(0,-1).join("\\");
		const newFilePath = `${folderPath}\\${path.basename(filePath, path.extname(filePath))}.json`;
		// Function to read the file
		function readFile() {
			try {
				vscode.window.showInformationMessage("Converting file to JSON");
				return fs.readFileSync(filePath, 'utf-8');
			}
			catch (err) {
				vscode.window.showErrorMessage("CSV file could not be read");
				throw err;
			}
		}
		const data = readFile();
		const arrays = data.split("\n").map(user => user.split(path.extname(filePath).toLowerCase() === '.tsv' ? "\t" : ","));
		const keys = arrays[0];
		const values = arrays.slice(1);
		// Create a new array of objects with the keys and values of each object corresponding to the headers and values of each row of the csv respectively
		const objects = values.map(array => {
			var item = {};
			keys.forEach((key, index) => item[key] = array[index]);
			return item;
		});
		const newFileContent = JSON.stringify(objects, null, '\t').replace(/\\r/g, "");

		// Write the converted file to a new location
		fs.writeFile(newFilePath, newFileContent, err => {
			if (err) {
				return vscode.window.showErrorMessage("Conversion to JSON failed!");
			}
			vscode.window.showInformationMessage("Conversion to JSON was successful!", "Open Now")
			.then(selection => {
				if (selection === "Open Now") {
					vscode.workspace.openTextDocument(newFilePath)
					.then(document => vscode.window.showTextDocument(document, vscode.ViewColumn.Beside, false));					
				}
			});
		});
	});

	// Implementation of the JSON to CSV conversion
	let toCSV = vscode.commands.registerCommand('json.toCSV', function () {
		const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
		const folderPath = filePath.split("\\").slice(0,-1).join("\\");
		const newFilePath = `${folderPath}\\${path.basename(filePath, ".json")}.csv`;
		// Function to read the file
		function readFile() {
			try {
				vscode.window.showInformationMessage("Converting file to CSV");
				return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
			}
			catch (err) {
				vscode.window.showErrorMessage("JSON file could not be read");
				throw err;
			}
		}
		const json = readFile();
		const objects = Array.isArray(json) ? json : [json];
		// const headers = Object.keys(array[0]).join(',') + '\n';
		// var body = "";
		var data = {};
		// Merge all objects into one with the values corresponding to an array of values from each merged object
		objects.forEach((object, index) => {
			const properties = Object.entries(object);
			properties.forEach(property => {
				if (data[property[0]] === undefined) {
					data[property[0]] = [];
					data[property[0]][index] = property[1];
				}
				else {
					data[property[0]][index] = property[1];
				}
			});
		});
		const headers = Object.keys(data).join(',') + '\n';
		var body = "";
		const values = Object.values(data);
		// Get the values for the headers of each row and store it in the 'body' variable
		for (var i = 0; i < values[0].length; i++) {
			var output = [];
			values.forEach(value => {
				output.push(value[i]);
			});
			body += output.join(',');
			body += (i !== values[0].length - 1) ? '\n' : '';
		}
		/* array.forEach((object, index, array) => {
		 	body += Object.values(object).join(',');
		 	body += index !== (array.length - 1) ? '\n' : '';
		 });*/
		const newFileContent = headers + body;

		// Write the converted file to a new location
		fs.writeFile(newFilePath, newFileContent, err => {
			if (err) {
				return vscode.window.showErrorMessage("Conversion to CSV failed!");
			}
			vscode.window.showInformationMessage("Conversion to CSV was successful!", "Open Now")
			.then(selection => {
				if (selection === "Open Now") {
					vscode.workspace.openTextDocument(newFilePath)
					.then(document => vscode.window.showTextDocument(document, vscode.ViewColumn.Beside, false));					
				}
			});
		});
	});

	context.subscriptions.push(toJSON);
	context.subscriptions.push(toCSV);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
