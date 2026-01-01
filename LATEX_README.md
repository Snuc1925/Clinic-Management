# Hướng Dẫn Sử Dụng File LaTeX - Báo Cáo Dự Án

## Tổng Quan

Repository này bao gồm báo cáo LaTeX cho dự án **Hệ Thống Quản Lý Phòng Khám Nha Khoa**.

### Các File LaTeX Có Sẵn

1. **chapter1.tex** - Phân tích và thiết kế hệ thống (MỚI)
   - Xác định thông tin cơ bản cho nghiệp vụ
   - Xây dựng biểu đồ mô tả nghiệp vụ và phân cấp chức năng
   - Xây dựng kế hoạch dự án đơn giản

2. **testing.tex** - Báo cáo kiểm thử phần mềm (ĐÃ CÓ SẴN)

3. **example_main.tex** - File mẫu để tạo document hoàn chỉnh

## Nội Dung Chi Tiết chapter1.tex

### 1. Xác định thông tin cơ bản cho nghiệp vụ của bài toán

Bao gồm 6 bảng phân tích nghiệp vụ với cấu trúc Input - Process - Output:
- Quản lý bệnh nhân
- Quản lý lịch hẹn  
- Quản lý điều trị
- Quản lý tồn kho
- Quản lý đơn đặt labo
- Báo cáo thống kê

### 2. Xây dựng biểu đồ mô tả nghiệp vụ và phân cấp chức năng

#### Biểu đồ hoạt động (Activity Diagram)
- Mô tả chi tiết quy trình điều trị bệnh nhân
- Luồng từng bước từ đăng ký đến hoàn thành điều trị
- Các điểm quyết định và xử lý ngoại lệ

#### Biểu đồ phân cấp chức năng (BFD)
Hệ thống được phân rã thành 3 cấp độ:
- **Cấp 0**: Hệ thống quản lý phòng khám nha khoa
- **Cấp 1**: 8 chức năng chính
- **Cấp 2**: Phân rã chi tiết từng chức năng

#### Bảng mô tả chức năng
Mô tả 15 chức năng chính với 3 cột:
- Tên chức năng
- Mô tả chi tiết
- Đánh giá khả năng thực hiện (nhân lực, thời gian, công nghệ, môi trường)

### 3. Xây dựng kế hoạch dự án đơn giản

#### Bảng 1: Phân rá công việc
- 11 công việc chính
- Phân rã thành 38 công việc con
- Tổng 392 giờ làm việc
- Ước lượng số người cho từng công việc

#### Bảng 2: Quản lý rủi ro
13 rủi ro được xác định với:
- Công việc/Hoạt động
- Mối nguy
- Rủi ro
- Mức độ (Cao/Trung bình/Thấp)
- Chiến lược (Tránh/Giảm thiểu/Chấp nhận)
- Biện pháp cụ thể

## Cách Sử Dụng

### Option 1: Sử dụng chapter1.tex độc lập

Bạn có thể include file `chapter1.tex` vào document chính của mình:

```latex
\documentclass{article}
\usepackage[utf8]{vietnam}
\usepackage[vietnamese]{babel}
% ... các package khác

\begin{document}
\section{Phân tích và thiết kế}
\input{chapter1}
\end{document}
```

### Option 2: Sử dụng file mẫu example_main.tex

1. Chỉnh sửa `example_main.tex` theo nhu cầu
2. Compile bằng pdfLaTeX:

```bash
pdflatex example_main.tex
pdflatex example_main.tex  # Chạy 2 lần để cập nhật references
```

### Option 3: Tích hợp vào document lớn hơn

```latex
\documentclass{report}
% Preamble...

\begin{document}
\chapter{Giới thiệu}
% ...

\chapter{Phân tích và thiết kế hệ thống}
\input{chapter1}

\chapter{Kiểm thử phần mềm}
\input{testing}

\end{document}
```

## Yêu Cầu Hệ Thống

### Packages LaTeX Cần Thiết

```latex
\usepackage[utf8]{vietnam}      % Hỗ trợ tiếng Việt
\usepackage[vietnamese]{babel}  % Ngôn ngữ tiếng Việt
\usepackage{amsmath}            % Công thức toán học
\usepackage{graphicx}           % Hình ảnh
\usepackage{array}              % Bảng nâng cao
\usepackage{longtable}          % Bảng dài
\usepackage{booktabs}           % Bảng đẹp
\usepackage{geometry}           % Căn lề
```

### Cài Đặt LaTeX

#### Windows
- Tải và cài [MiKTeX](https://miktex.org/download) hoặc [TeX Live](https://www.tug.org/texlive/)
- Sử dụng TeXstudio hoặc TeXmaker làm editor

#### macOS
```bash
brew install --cask mactex
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install texlive-full
sudo apt-get install texlive-lang-other  # Cho tiếng Việt
```

## Compile Document

### Sử dụng Command Line

```bash
# Compile lần 1
pdflatex example_main.tex

# Compile lần 2 (để cập nhật references, table of contents)
pdflatex example_main.tex

# Xem file PDF
# Windows: start example_main.pdf
# macOS: open example_main.pdf
# Linux: xdg-open example_main.pdf
```

### Sử dụng LaTeX Editor

1. Mở file `.tex` trong TeXstudio/TeXmaker/Overleaf
2. Chọn compiler: **pdfLaTeX**
3. Click nút "Build & View" hoặc nhấn F5

## Overleaf (Online LaTeX Editor)

Nếu không muốn cài đặt LaTeX locally:

1. Truy cập [Overleaf.com](https://www.overleaf.com)
2. Tạo New Project → Upload Project
3. Upload các file .tex
4. Compiler sẽ tự động compile

## Cấu Trúc Dự Án Đề Xuất

```
project-report/
├── main.tex                    # File chính
├── chapter1.tex               # Phân tích và thiết kế
├── testing.tex                # Kiểm thử
├── images/                    # Thư mục chứa hình ảnh
│   ├── logo.png
│   └── diagrams/
├── bibliography.bib           # Tài liệu tham khảo (nếu có)
└── README.md                  # File này
```

## Tùy Chỉnh

### Thay đổi Font Size

```latex
\documentclass[11pt,a4paper]{article}  % 11pt thay vì 12pt
```

### Thay đổi Margins

```latex
\usepackage{geometry}
\geometry{a4paper, margin=2cm}  % Margin 2cm thay vì 2.5cm
```

### Thêm Header/Footer

```latex
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhead[L]{Báo Cáo Dự Án}
\fancyhead[R]{Nhóm XX}
```

## Lưu Ý Quan Trọng

1. **Encoding**: File phải được lưu với encoding **UTF-8** để hiển thị tiếng Việt đúng
2. **Compile 2 lần**: Luôn compile ít nhất 2 lần để cập nhật table of contents và references
3. **Package vietnam**: Đảm bảo đã cài package `vietnam` cho LaTeX
4. **Độ rộng bảng**: Một số bảng khá rộng, có thể cần xoay ngang:
   ```latex
   \usepackage{rotating}
   \begin{sidewaystable}
   % ... table content
   \end{sidewaystable}
   ```

## Troubleshooting

### Lỗi: "Package vietnam not found"
```bash
# Ubuntu/Debian
sudo apt-get install texlive-lang-other

# MiKTeX: Mở MiKTeX Console → Packages → Install "vietnam"
```

### Lỗi: "Font not found" cho tiếng Việt
```bash
# Cài font tiếng Việt
sudo apt-get install fonts-vietnamese
```

### Bảng quá rộng
```latex
% Giảm font size cho bảng cụ thể
\begin{table}[h]
\scriptsize  % hoặc \footnotesize
% ... table content
\end{table}
```

### Lỗi compile: "Undefined control sequence"
- Kiểm tra tất cả các package đã được include
- Đảm bảo không có ký tự đặc biệt chưa được escape (%, &, #, etc.)

## Hỗ Trợ

Nếu gặp vấn đề khi compile hoặc cần tùy chỉnh thêm, vui lòng:
1. Kiểm tra log file (`.log`) để xem lỗi chi tiết
2. Google error message cụ thể
3. Tham khảo [LaTeX Stack Exchange](https://tex.stackexchange.com/)

## Tác Giả

File LaTeX được tạo tự động dựa trên phân tích source code của dự án **Clinic Management System**.

## License

Same as project license.
