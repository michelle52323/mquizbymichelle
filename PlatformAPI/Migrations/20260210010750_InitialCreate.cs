using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PlatformAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AnswerChoices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "varchar(255)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnswerChoices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Genders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Genders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuestionTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "varchar(255)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Subjects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subjects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SymbolCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SymbolCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SymbolLibrary",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UnicodeValue = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LatexValue = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AssetPath = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SymbolLibrary", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Themes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Themes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ThemeVariables",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    GroupId = table.Column<int>(type: "int", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThemeVariables", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuestionAnswers",
                columns: table => new
                {
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    AnswerChoiceId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionAnswers", x => new { x.QuestionId, x.AnswerChoiceId });
                    table.ForeignKey(
                        name: "FK_QuestionAnswers_AnswerChoices_AnswerChoiceId",
                        column: x => x.AnswerChoiceId,
                        principalTable: "AnswerChoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(max)", maxLength: 50, nullable: false),
                    QuestionTypeId = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Questions_QuestionTypes_QuestionTypeId",
                        column: x => x.QuestionTypeId,
                        principalTable: "QuestionTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Quizzes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubjectId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", maxLength: 50, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quizzes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quizzes_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ThemeVariablesColors",
                columns: table => new
                {
                    ThemeId = table.Column<int>(type: "int", nullable: false),
                    ThemeVariableId = table.Column<int>(type: "int", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThemeVariablesColors", x => new { x.ThemeId, x.ThemeVariableId });
                    table.ForeignKey(
                        name: "FK_ThemeVariablesColors_ThemeVariables_ThemeVariableId",
                        column: x => x.ThemeVariableId,
                        principalTable: "ThemeVariables",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MiddleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Pronouns = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    GenderId = table.Column<int>(type: "int", nullable: false),
                    UserTypeId = table.Column<int>(type: "int", nullable: false),
                    ThemeId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Genders_GenderId",
                        column: x => x.GenderId,
                        principalTable: "Genders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Users_UserTypes_UserTypeId",
                        column: x => x.UserTypeId,
                        principalTable: "UserTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizQuestions",
                columns: table => new
                {
                    QuizId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestions", x => new { x.QuizId, x.QuestionId });
                    table.ForeignKey(
                        name: "FK_QuizQuestions_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserQuizzes",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    QuizId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserQuizzes", x => new { x.UserId, x.QuizId });
                    table.ForeignKey(
                        name: "FK_UserQuizzes_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LoginAttempts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IPAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WasSuccessful = table.Column<bool>(type: "bit", nullable: false),
                    FailureReason = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoginAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoginAttempts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Description", "IsActive", "SortOrder" },
                values: new object[,]
                {
                    { 1, "Addition", true, 1 },
                    { 2, "Subtraction", true, 2 },
                    { 3, "Multiplication", true, 3 },
                    { 4, "Division", true, 4 },
                    { 5, "Fractions", true, 5 },
                    { 6, "Decimals", true, 6 },
                    { 7, "Percents", true, 7 },
                    { 8, "Place Value", true, 8 },
                    { 9, "Number Patterns", true, 9 },
                    { 10, "Word Problems", true, 10 },
                    { 11, "Measurement", true, 11 },
                    { 12, "Time", true, 12 },
                    { 13, "Money", true, 13 },
                    { 14, "Geometry Concepts", true, 14 },
                    { 15, "Algebraic Thinking", true, 15 },
                    { 16, "Data Interpretation", true, 16 },
                    { 17, "Probability", true, 17 },
                    { 18, "Graphs & Charts", true, 18 },
                    { 19, "Order of Operations", true, 19 },
                    { 20, "Equations & Expressions", true, 20 },
                    { 21, "Linear Equations", true, 21 },
                    { 22, "Inequalities", true, 22 },
                    { 23, "Systems of Equations", true, 23 },
                    { 24, "Exponents & Powers", true, 24 },
                    { 25, "Polynomials", true, 25 },
                    { 26, "Factoring", true, 26 },
                    { 27, "Quadratic Equations", true, 27 },
                    { 28, "Rational Expressions", true, 28 },
                    { 29, "Functions & Graphs", true, 29 },
                    { 30, "Angles & Lines", true, 30 },
                    { 31, "Triangles", true, 31 },
                    { 32, "Quadrilaterals", true, 32 },
                    { 33, "Circles", true, 33 },
                    { 34, "Area & Perimeter", true, 34 },
                    { 35, "Volume & Surface Area", true, 35 },
                    { 36, "Coordinate Geometry", true, 36 },
                    { 37, "Transformations", true, 37 },
                    { 38, "Proofs & Reasoning", true, 38 },
                    { 39, "Limits & Continuity", true, 39 },
                    { 40, "Derivatives", true, 40 },
                    { 41, "Applications of Derivatives", true, 41 },
                    { 42, "Integrals", true, 42 },
                    { 43, "Applications of Integrals", true, 43 },
                    { 44, "Differential Equations", true, 44 },
                    { 45, "Sequences & Series", true, 45 }
                });

            migrationBuilder.InsertData(
                table: "Genders",
                columns: new[] { "Id", "Code", "Description" },
                values: new object[,]
                {
                    { 1, "F", "Female" },
                    { 2, "M", "Male" },
                    { 3, "TG", "Transgender" },
                    { 4, "NB", "Non-binary" },
                    { 5, "X", "Other" }
                });

            migrationBuilder.InsertData(
                table: "QuestionTypes",
                columns: new[] { "Id", "Description", "IsActive", "SortOrder" },
                values: new object[,]
                {
                    { 1, "Multiple Choice", true, 1 },
                    { 2, "True / False", false, 2 },
                    { 3, "Open-Ended Numeric", false, 3 }
                });

            migrationBuilder.InsertData(
                table: "Subjects",
                columns: new[] { "Id", "Description", "IsActive", "SortOrder" },
                values: new object[,]
                {
                    { 1, "Grades 1-3", true, 1 },
                    { 2, "Grades 4-5", true, 2 },
                    { 3, "Grades 6-8", true, 3 },
                    { 4, "Algebra", true, 4 },
                    { 5, "Geometry", true, 5 },
                    { 6, "Pre Calculus", true, 6 },
                    { 7, "Calculus", true, 7 },
                    { 8, "Statistics", true, 8 },
                    { 9, "Test Prep", true, 9 },
                    { 10, "Applied Math", true, 10 },
                    { 11, "Data and Probability", true, 11 }
                });

            migrationBuilder.InsertData(
                table: "SymbolCategories",
                columns: new[] { "Id", "Description", "IsActive", "SortOrder" },
                values: new object[,]
                {
                    { 1, "Basic Operators", true, 1 },
                    { 2, "Algebra", true, 2 },
                    { 3, "Fractions & Radicals", true, 3 },
                    { 4, "Inequalities", true, 4 },
                    { 5, "Greek Letters", true, 5 },
                    { 6, "Geometry", true, 6 },
                    { 7, "Calculus", true, 7 },
                    { 8, "Set Theory & Logic", true, 8 },
                    { 9, "Arrows", true, 9 },
                    { 10, "Miscellaneous", true, 10 }
                });

            migrationBuilder.InsertData(
                table: "SymbolLibrary",
                columns: new[] { "Id", "AssetPath", "CategoryId", "Description", "IsActive", "LatexValue", "Name", "SortOrder", "UnicodeValue" },
                values: new object[,]
                {
                    { 1, null, 1, "Addition operator", true, null, "Plus", 1, "+" },
                    { 2, null, 1, "Subtraction operator", true, null, "Minus", 2, "−" },
                    { 3, null, 1, "Multiplication sign", true, "\\times", "Multiply", 3, "×" },
                    { 4, null, 1, "Division sign", true, "\\div", "Divide", 4, "÷" },
                    { 5, null, 1, "Equality sign", true, null, "Equals", 5, "=" },
                    { 6, null, 1, "Not equal sign", true, "\\neq", "NotEqual", 6, "≠" },
                    { 7, null, 1, "Dot multiplication", true, "\\cdot", "DotOperator", 7, "·" },
                    { 8, null, 1, "Percent symbol", true, null, "Percent", 8, "%" },
                    { 9, null, 2, "Left parenthesis", true, null, "LeftParen", 1, "(" },
                    { 10, null, 2, "Right parenthesis", true, null, "RightParen", 2, ")" },
                    { 11, null, 2, "Left bracket", true, null, "LeftBracket", 3, "[" },
                    { 12, null, 2, "Right bracket", true, null, "RightBracket", 4, "]" },
                    { 13, null, 2, "Left brace", true, "\\{", "LeftBrace", 5, "{" },
                    { 14, null, 2, "Right brace", true, "\\}", "RightBrace", 6, "}" },
                    { 15, null, 2, "Absolute value", true, null, "AbsoluteValue", 7, null },
                    { 16, null, 2, "Exponent template", true, null, "Exponent", 8, null },
                    { 17, null, 2, "Subscript template", true, null, "Subscript", 9, null },
                    { 18, null, 3, "Square root", true, "\\sqrt{}", "SquareRoot", 1, "√" },
                    { 19, null, 3, "Cube root", true, "\\sqrt[3]{}", "CubeRoot", 2, "∛" },
                    { 20, null, 3, "Fraction template", true, null, "Fraction", 3, null },
                    { 21, null, 3, "Mixed number", true, null, "MixedNumber", 4, null },
                    { 22, null, 3, "Nth‑root template", true, null, "NthRoot", 5, null },
                    { 23, null, 4, "Less‑than sign", true, null, "LessThan", 1, "<" },
                    { 24, null, 4, "Greater‑than sign", true, null, "GreaterThan", 2, ">" },
                    { 25, null, 4, "Less or equal", true, "\\le", "LessEqual", 3, "≤" },
                    { 26, null, 4, "Greater or equal", true, "\\ge", "GreaterEqual", 4, "≥" },
                    { 27, null, 4, "Approximate sign", true, "\\approx", "Approximately", 5, "≈" },
                    { 28, null, 4, "Congruent sign", true, "\\cong", "Congruent", 6, "≅" },
                    { 29, null, 5, "Greek letter alpha", true, "\\alpha", "Alpha", 1, "α" },
                    { 30, null, 5, "Greek letter beta", true, "\\beta", "Beta", 2, "β" },
                    { 31, null, 5, "Greek letter gamma", true, "\\gamma", "Gamma", 3, "γ" },
                    { 32, null, 5, "Greek letter theta", true, "\\theta", "Theta", 4, "θ" },
                    { 33, null, 5, "Greek letter lambda", true, "\\lambda", "Lambda", 5, "λ" },
                    { 34, null, 5, "Greek letter mu", true, "\\mu", "Mu", 6, "μ" },
                    { 35, null, 5, "Greek letter pi", true, "\\pi", "Pi", 7, "π" },
                    { 36, null, 5, "Greek letter omega", true, "\\Omega", "Omega", 8, "Ω" },
                    { 37, null, 6, "Angle symbol", true, "\\angle", "Angle", 1, "∠" },
                    { 38, null, 6, "Degree symbol", true, "^\\circ", "Degree", 2, "°" },
                    { 39, null, 6, "Perpendicular sign", true, "\\perp", "Perpendicular", 3, "⟂" },
                    { 40, null, 6, "Parallel sign", true, "\\parallel", "Parallel", 4, "∥" },
                    { 41, null, 6, "Triangle symbol", true, "\\triangle", "Triangle", 5, "△" },
                    { 42, null, 6, "Square symbol", true, null, "Square", 6, "□" },
                    { 43, null, 7, "Integral sign", true, "\\int", "Integral", 1, "∫" },
                    { 44, null, 7, "Summation sign", true, "\\sum", "Summation", 2, "∑" },
                    { 45, null, 7, "Product sign", true, "\\prod", "Product", 3, "∏" },
                    { 46, null, 7, "Limit operator", true, "\\lim", "Limit", 4, null },
                    { 47, null, 7, "Derivative template", true, null, "Derivative", 5, null },
                    { 48, null, 7, "Integral template", true, null, "IntegralTemplate", 6, null },
                    { 49, null, 8, "Element of", true, "\\in", "ElementOf", 1, "∈" },
                    { 50, null, 8, "Not element of", true, "\\notin", "NotElementOf", 2, "∉" },
                    { 51, null, 8, "Union of sets", true, "\\cup", "Union", 3, "∪" },
                    { 52, null, 8, "Intersection of sets", true, "\\cap", "Intersection", 4, "∩" },
                    { 53, null, 8, "Proper subset", true, "\\subset", "Subset", 5, "⊂" },
                    { 54, null, 8, "Subset or equal", true, "\\subseteq", "SubsetEqual", 6, "⊆" },
                    { 55, null, 8, "Universal quantifier", true, "\\forall", "ForAll", 7, "∀" },
                    { 56, null, 8, "Existential quantifier", true, "\\exists", "Exists", 8, "∃" },
                    { 57, null, 8, "Implies symbol", true, "\\Rightarrow", "Implies", 9, "⇒" },
                    { 58, null, 8, "If and only if", true, "\\Leftrightarrow", "Iff", 10, "⇔" },
                    { 59, null, 9, "Right arrow", true, "\\to", "RightArrow", 1, "→" },
                    { 60, null, 9, "Left arrow", true, "\\leftarrow", "LeftArrow", 2, "←" },
                    { 61, null, 9, "Two‑way arrow", true, "\\leftrightarrow", "DoubleArrow", 3, "↔" },
                    { 62, null, 9, "Maps‑to arrow", true, "\\mapsto", "MapsTo", 4, "↦" },
                    { 63, null, 10, "Infinity symbol", true, "\\infty", "Infinity", 1, "∞" },
                    { 64, null, 10, "Factorial symbol", true, null, "Factorial", 2, "!" },
                    { 65, null, 10, "Function composition", true, "\\circ", "Composition", 3, "∘" }
                });

            migrationBuilder.InsertData(
                table: "ThemeVariables",
                columns: new[] { "Id", "Description", "GroupId", "SortOrder" },
                values: new object[,]
                {
                    { 1, "dropdownBackColor", 1, 1 },
                    { 2, "dropdownTextColor", 1, 3 },
                    { 3, "dropdownHoverBackColor", 1, 4 },
                    { 4, "dropdownHoverTextColor", 1, 6 },
                    { 5, "dropdownContentBackgroundColor", 1, 7 },
                    { 6, "dropdownContentTextColor", 1, 9 },
                    { 7, "textBoxLabelColor", 2, 1 },
                    { 8, "buttonBackgroundColor", 3, 1 },
                    { 9, "buttonTextColor", 3, 3 },
                    { 10, "buttonHoverBackgroundColor", 3, 4 },
                    { 11, "buttonHoverTextColor", 3, 6 },
                    { 12, "contentBackColor", 4, 1 },
                    { 13, "textBoxTextColor", 2, 2 },
                    { 14, "textBoxBackColor", 2, 3 },
                    { 15, "outsideBackColor", 5, 1 },
                    { 16, "textBoxBorderColor", 2, 5 },
                    { 17, "dropdownBackColorGradient", 1, 2 },
                    { 18, "dropdownHoverBackColorGradient", 1, 5 },
                    { 19, "dropdownContentBackgroundColorGradient", 1, 8 },
                    { 20, "buttonBackgroundColorGradient", 3, 2 },
                    { 21, "buttonHoverBackgroundColorGradient", 3, 5 },
                    { 22, "contentBackColorGradient", 4, 2 },
                    { 23, "textBoxBackColorGradient", 2, 4 },
                    { 24, "outsideBackColorGradient", 5, 2 },
                    { 25, "contentHeaderBackColor", 7, 1 },
                    { 26, "contentHeaderBackColorGradient", 7, 2 },
                    { 27, "contentHeaderTextColor", 7, 3 },
                    { 28, "contentTextColor", 7, 4 },
                    { 29, "linkTextColor", 7, 5 },
                    { 30, "radioLabelColor", 8, 1 },
                    { 31, "radioHoverColor", 8, 2 },
                    { 32, "radioCheckColor", 8, 3 },
                    { 33, "dialogHeaderBackColor", 9, 1 },
                    { 34, "dialogHeaderBackColorGradient", 9, 2 },
                    { 35, "dialogHeaderTextColor", 9, 3 },
                    { 36, "dialogContentBackColor", 9, 4 },
                    { 37, "dialogContentBackColorGradient", 9, 5 },
                    { 38, "dialogContentTextColor", 9, 6 },
                    { 39, "sortableBorder", 10, 1 },
                    { 40, "sortableHighlightBackColor", 10, 2 },
                    { 41, "sortableHighlightBackColorGradient", 10, 3 },
                    { 42, "textBoxBorderColorSelected", 2, 6 },
                    { 43, "passwordIconColor", 2, 7 }
                });

            migrationBuilder.InsertData(
                table: "Themes",
                columns: new[] { "Id", "Description", "IsActive", "SortOrder" },
                values: new object[,]
                {
                    { 1, "Light Blue", true, 1 },
                    { 2, "Dark", false, 2 },
                    { 3, "Dark Teal", true, 3 },
                    { 4, "Light Green", true, 4 },
                    { 5, "Dark Green", true, 5 }
                });

            migrationBuilder.InsertData(
                table: "UserTypes",
                columns: new[] { "Id", "Code", "Description" },
                values: new object[,]
                {
                    { 1, "SA", "Super Administrator" },
                    { 2, "A", "Administrator" },
                    { 3, "I", "Instructor" },
                    { 4, "S", "Student" }
                });

            migrationBuilder.InsertData(
                table: "ThemeVariablesColors",
                columns: new[] { "ThemeId", "ThemeVariableId", "Color" },
                values: new object[,]
                {
                    { 1, 1, "#0058f2" },
                    { 1, 2, "#ffffff" },
                    { 1, 3, "#0030a0" },
                    { 1, 4, "#FFFFFF" },
                    { 1, 5, "#0058f2" },
                    { 1, 6, "#FFFFFF" },
                    { 1, 7, "#0048d1" },
                    { 1, 8, "#0058f2" },
                    { 1, 9, "#ffffff" },
                    { 1, 10, "#0030a0" },
                    { 1, 11, "#ffffff" },
                    { 1, 12, "#ffffff" },
                    { 1, 13, "#000000" },
                    { 1, 14, "#A0C2FF" },
                    { 1, 15, "#f3f5f7" },
                    { 1, 16, "#0000ee" },
                    { 1, 17, "#3178dd" },
                    { 1, 18, "#0042b8" },
                    { 1, 19, "#3178dd" },
                    { 1, 20, "#3178dd" },
                    { 1, 21, "#0042b8" },
                    { 1, 22, "#efefef" },
                    { 1, 23, "#78AFFF" },
                    { 1, 24, "#e3e5e7" },
                    { 1, 25, "#0054ff" },
                    { 1, 26, "#1074ef" },
                    { 1, 27, "#ffffff" },
                    { 1, 28, "#0038a1" },
                    { 1, 29, "#0038a1" },
                    { 1, 30, "#0048d1" },
                    { 1, 31, "#003cb5" },
                    { 1, 32, "#0048d1" },
                    { 1, 33, "#0054ff" },
                    { 1, 34, "#1074ef" },
                    { 1, 35, "#ffffff" },
                    { 1, 36, "#c3c5c7" },
                    { 1, 37, "#b3b5b7" },
                    { 1, 38, "#00143f" },
                    { 1, 39, "#0048d1" },
                    { 1, 40, "#0048d1" },
                    { 1, 41, "#0058f2" },
                    { 1, 42, "#101010" },
                    { 1, 43, "#000000" },
                    { 2, 1, "#131210" },
                    { 2, 2, "#ffffff" },
                    { 2, 3, "#050302" },
                    { 2, 4, "#ffffff" },
                    { 2, 5, "#1f1e1c" },
                    { 2, 6, "#ffffff" },
                    { 2, 7, "#ffffff" },
                    { 2, 8, "#131210" },
                    { 2, 9, "#ffffff" },
                    { 2, 10, "#050302" },
                    { 2, 11, "#ffffff" },
                    { 2, 12, "#343434" },
                    { 2, 13, "#ffffff" },
                    { 2, 14, "#141414" },
                    { 2, 15, "#0c0a08" },
                    { 2, 16, "#18b5ea" },
                    { 2, 17, "#232220" },
                    { 2, 18, "#151312" },
                    { 2, 19, "#2f2e2c" },
                    { 2, 20, "#232220" },
                    { 2, 21, "#151312" },
                    { 2, 22, "#444444" },
                    { 2, 23, "#242424" },
                    { 2, 24, "#1c1a18" },
                    { 2, 25, "#131210" },
                    { 2, 26, "#232220" },
                    { 2, 27, "#ffffff" },
                    { 2, 28, "#ffffff" },
                    { 2, 29, "#ffffff" },
                    { 2, 30, "#ffffff" },
                    { 2, 31, "#bbbbbb" },
                    { 2, 32, "#ffffff" },
                    { 2, 33, "#131210" },
                    { 2, 34, "#232220" },
                    { 2, 35, "#ffffff" },
                    { 2, 36, "#acaaa8" },
                    { 2, 37, "#bcbab8" },
                    { 2, 38, "#000000" },
                    { 2, 39, "#ffffff" },
                    { 2, 40, "#ffffff" },
                    { 2, 41, "#dfdfdf" },
                    { 2, 42, "#FFFFFF" },
                    { 2, 43, "#ffffff" },
                    { 3, 1, "#0B5257" },
                    { 3, 2, "#ffffff" },
                    { 3, 3, "#0E3733" },
                    { 3, 4, "#ffffff" },
                    { 3, 5, "#0B5257" },
                    { 3, 6, "#ffffff" },
                    { 3, 7, "#00B0A0" },
                    { 3, 8, "#0B5257" },
                    { 3, 9, "#ffffff" },
                    { 3, 10, "#0E2723" },
                    { 3, 11, "#ffffff" },
                    { 3, 12, "#000000" },
                    { 3, 13, "#00B0A0" },
                    { 3, 14, "#0B4A4F" },
                    { 3, 15, "#0C0A08" },
                    { 3, 16, "#18b5ea" },
                    { 3, 17, "#123D3A" },
                    { 3, 18, "#0E3733" },
                    { 3, 19, "#1A3F3A" },
                    { 3, 20, "#1A3F3A" },
                    { 3, 21, "#0E3733" },
                    { 3, 22, "#101010" },
                    { 3, 23, "#242424" },
                    { 3, 24, "#1C1A18" },
                    { 3, 25, "#0B5257" },
                    { 3, 26, "#1A3F3A" },
                    { 3, 27, "#00B8A8" },
                    { 3, 28, "#00B0A0" },
                    { 3, 29, "#00B0A0" },
                    { 3, 30, "#00B0A0" },
                    { 3, 31, "#006D5B" },
                    { 3, 32, "#00B0A0" },
                    { 3, 33, "#0B5257" },
                    { 3, 34, "#1A3F3A" },
                    { 3, 35, "#00B8A8" },
                    { 3, 36, "#acaaa8" },
                    { 3, 37, "#bcbab8" },
                    { 3, 38, "#001205" },
                    { 3, 39, "#008080" },
                    { 3, 40, "#008080" },
                    { 3, 41, "#20a295" },
                    { 3, 42, "#FFFFFF" },
                    { 3, 43, "#00B0A0" },
                    { 4, 1, "#009837" },
                    { 4, 2, "#ffffff" },
                    { 4, 3, "#115543" },
                    { 4, 4, "#ffffff" },
                    { 4, 5, "#00751F" },
                    { 4, 6, "#ffffff" },
                    { 4, 7, "#009837" },
                    { 4, 8, "#009837" },
                    { 4, 9, "#ffffff" },
                    { 4, 10, "#115543" },
                    { 4, 11, "#ffffff" },
                    { 4, 12, "#f7fffe" },
                    { 4, 13, "#00321A" },
                    { 4, 14, "#31C74D" },
                    { 4, 15, "#fafefd" },
                    { 4, 16, "#008000" },
                    { 4, 17, "#10a847" },
                    { 4, 18, "#107847" },
                    { 4, 19, "#10a847" },
                    { 4, 20, "#10a847" },
                    { 4, 21, "#107847" },
                    { 4, 22, "#e7efee" },
                    { 4, 23, "#37B74D" },
                    { 4, 24, "#eaeeed" },
                    { 4, 25, "#009837" },
                    { 4, 26, "#10a847" },
                    { 4, 27, "#ffffff" },
                    { 4, 28, "#006327" },
                    { 4, 29, "#006327" },
                    { 4, 30, "#009837" },
                    { 4, 31, "#006235" },
                    { 4, 32, "#009837" },
                    { 4, 33, "#009837" },
                    { 4, 34, "#10a847" },
                    { 4, 35, "#ffffff" },
                    { 4, 36, "#cacecd" },
                    { 4, 37, "#babebd" },
                    { 4, 38, "#003225" },
                    { 4, 39, "#009837" },
                    { 4, 40, "#009837" },
                    { 4, 41, "#208255" },
                    { 4, 42, "#101010" },
                    { 4, 43, "#00321A" },
                    { 5, 1, "#0e7733" },
                    { 5, 2, "#ffffff" },
                    { 5, 3, "#073411" },
                    { 5, 4, "#ffffff" },
                    { 5, 5, "#0e7733" },
                    { 5, 6, "#ffffff" },
                    { 5, 7, "#00BF73" },
                    { 5, 8, "#0e7733" },
                    { 5, 9, "#ffffff" },
                    { 5, 10, "#073411" },
                    { 5, 11, "#ffffff" },
                    { 5, 12, "#000000" },
                    { 5, 13, "#00BF73" },
                    { 5, 14, "#0C4D40" },
                    { 5, 15, "#0c0a08" },
                    { 5, 16, "#18aa45" },
                    { 5, 17, "#184615" },
                    { 5, 18, "#0F3510" },
                    { 5, 19, "#184615" },
                    { 5, 20, "#184615" },
                    { 5, 21, "#0F3510" },
                    { 5, 22, "#101010" },
                    { 5, 23, "#242424" },
                    { 5, 24, "#1c1a18" },
                    { 5, 25, "#0e7733" },
                    { 5, 26, "#184615" },
                    { 5, 27, "#002225" },
                    { 5, 28, "#00BF73" },
                    { 5, 29, "#00BF73" },
                    { 5, 30, "#00BF73" },
                    { 5, 31, "#007235" },
                    { 5, 32, "#00BF73" },
                    { 5, 33, "#0e7733" },
                    { 5, 34, "#184615" },
                    { 5, 35, "#001A25" },
                    { 5, 36, "#acaaa8" },
                    { 5, 37, "#bcbab8" },
                    { 5, 38, "#001A25" },
                    { 5, 39, "#00BF73" },
                    { 5, 40, "#00BF73" },
                    { 5, 41, "#149F53" },
                    { 5, 42, "#FFFFFF" },
                    { 5, 43, "#00BF73" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_LoginAttempts_UserId",
                table: "LoginAttempts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionAnswers_AnswerChoiceId",
                table: "QuestionAnswers",
                column: "AnswerChoiceId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Questions_QuestionTypeId",
                table: "Questions",
                column: "QuestionTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestions_QuestionId",
                table: "QuizQuestions",
                column: "QuestionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Quizzes_SubjectId",
                table: "Quizzes",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ThemeVariablesColors_ThemeVariableId",
                table: "ThemeVariablesColors",
                column: "ThemeVariableId");

            migrationBuilder.CreateIndex(
                name: "IX_UserQuizzes_QuizId",
                table: "UserQuizzes",
                column: "QuizId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_GenderId",
                table: "Users",
                column: "GenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserTypeId",
                table: "Users",
                column: "UserTypeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "LoginAttempts");

            migrationBuilder.DropTable(
                name: "QuestionAnswers");

            migrationBuilder.DropTable(
                name: "QuizQuestions");

            migrationBuilder.DropTable(
                name: "SymbolCategories");

            migrationBuilder.DropTable(
                name: "SymbolLibrary");

            migrationBuilder.DropTable(
                name: "Themes");

            migrationBuilder.DropTable(
                name: "ThemeVariablesColors");

            migrationBuilder.DropTable(
                name: "UserQuizzes");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "AnswerChoices");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "ThemeVariables");

            migrationBuilder.DropTable(
                name: "Quizzes");

            migrationBuilder.DropTable(
                name: "Genders");

            migrationBuilder.DropTable(
                name: "UserTypes");

            migrationBuilder.DropTable(
                name: "QuestionTypes");

            migrationBuilder.DropTable(
                name: "Subjects");
        }
    }
}
