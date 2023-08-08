// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn import_images(path: &str, dest: &str) -> Result<String, String> {
    println!("Importing images from {}", path);

    let dir_list = fs::read_dir(path).unwrap();

    for entry in dir_list {
        let entry = entry.unwrap();
        let path = entry.path();
        let file_name = path.file_name().unwrap().to_str().unwrap();
        println!("Importing {}", file_name);

        // filter out non-image files
        if !file_name.ends_with(".jpg") && !file_name.ends_with(".jpeg") {
            println!("Skipping {}", file_name);
            continue;
        }

        // copy file to app data folder
        let dest_path = format!("{}/{}", dest, file_name);
        fs::copy(path, dest_path).unwrap();
    }

    Ok("Ok".to_string())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
            let window = app.get_window("main").unwrap();
            window.open_devtools();
            window.close_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, import_images])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
