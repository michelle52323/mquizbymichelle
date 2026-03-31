using Microsoft.EntityFrameworkCore;
using PlatformAPI.Models.Quizzes;
using PlatformAPI.Models.StudentQuizzes;
using PlatformAPI.Models.Subjects;
using PlatformAPI.Models.SymbolLibrary;
using PlatformAPI.Models.Themes;
using PlatformAPI.Models.Users;

using System.Collections.Generic;

namespace PlatformAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Theme> Themes { get; set; }

        public DbSet<ThemeVariable> ThemeVariables { get; set; }

        public DbSet<ThemeVariableColor> ThemeVariablesColors { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<Gender> Genders { get; set; }

        public DbSet<UserType> UserTypes { get; set; }

        public DbSet<LoginAttempt> LoginAttempts { get; set; }
        
        public DbSet<Quiz> Quizzes { get; set; }

        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionType> QuestionTypes { get; set; }

        public DbSet<AnswerChoice> AnswerChoices { get; set; }

        public DbSet<UserQuiz> UserQuizzes { get; set; }

        public DbSet<QuizQuestion> QuizQuestions { get; set; }

        public DbSet<QuestionAnswer> QuestionAnswers { get; set; }

        public DbSet<Subject> Subjects { get; set; }

        public DbSet<Category> Categories { get; set; }

        public DbSet<SymbolCategory> SymbolCategories { get; set; }

        public DbSet<SymbolLibrary> SymbolLibrary { get; set; }

        public DbSet<StudentQuizAssignment> StudentQuizAssignments { get; set; }

        public DbSet<StudentQuizAttempt> StudentQuizAttempts { get; set; }

        public DbSet<StudentQuizAnswers> StudentQuizAnswers { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<SymbolLibrary>()
            .ToTable("SymbolLibrary");

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    // Apply default length of 50 to all strings
                    if (property.ClrType == typeof(string))
                    {
                        // Skip specific overrides
                        if (property.Name.Contains("Code"))
                        {
                            property.SetMaxLength(2); // Override: Code fields get length 2
                        }
                        else if (property.Name.Contains("Color"))
                        {
                            property.SetMaxLength(7); // Override: Color fields get length 7
                        }
                        else if (property.Name.Contains("Password"))
                        {
                            property.SetMaxLength(255); // Override: Color fields get length 255
                        }
                        else if (property.Name.Contains("FailureReason"))
                        {
                            property.SetMaxLength(100);
                        }
                        else if (property.GetMaxLength() == null)
                        {
                            property.SetMaxLength(50); // Default: Apply 50 if unconstrained
                        }

                    }
                }
            }

            //// Quizzes.Description → varchar(max)
            //modelBuilder.Entity<Quiz>()
            //    .Property(q => q.Description)
            //    .HasColumnType("text");

            //// Questions.Description → varchar(max)
            //modelBuilder.Entity<Question>()
            //    .Property(q => q.Description)
            //    .HasColumnType("text");

            modelBuilder.Entity<Quiz>()
                .Property(q => q.Name)
                .HasColumnType("nvarchar(100)");

            modelBuilder.Entity<Quiz>()
                .Property(q => q.Description)
                .HasColumnType("nvarchar(max)");

            modelBuilder.Entity<Question>()
                .Property(q => q.Description)
                .HasColumnType("nvarchar(max)");


            // QuestionTypes.Description → varchar(255)
            modelBuilder.Entity<QuestionType>()
                .Property(qt => qt.Description)
                .HasColumnType("varchar(255)");

            // AnswerChoices.Description → varchar(255)
            modelBuilder.Entity<AnswerChoice>()
                .Property(ac => ac.Description)
                .HasColumnType("varchar(255)");


            //Set complex primary keys
            modelBuilder.Entity<ThemeVariableColor>()
                .HasKey(tv => new { tv.ThemeId, tv.ThemeVariableId });

            modelBuilder.Entity <UserQuiz>()
                .HasKey(uq => new { uq.UserId, uq.QuizId });

            modelBuilder.Entity<QuizQuestion>()
                .HasKey(qq => new { qq.QuizId, qq.QuestionId });

            modelBuilder.Entity<QuestionAnswer>()
                .HasKey(qa => new {qa.QuestionId, qa.AnswerChoiceId});


            //Seed default data

            modelBuilder.Entity<Gender>().HasData(
                new Gender { Id = 1, Description = "Female", Code = "F" },
                new Gender { Id = 2, Description = "Male", Code = "M" },
                new Gender { Id = 3, Description = "Transgender", Code = "TG" },
                new Gender { Id = 4, Description = "Non-binary", Code = "NB" },
                new Gender { Id = 5, Description = "Other", Code = "X" }
            );

            modelBuilder.Entity<UserType>().HasData(
                new UserType { Id = 1, Description = "Super Administrator", Code = "SA" },
                new UserType { Id = 2, Description = "Administrator", Code = "A" },
                new UserType { Id = 3, Description = "Instructor", Code = "I" },
                new UserType { Id = 4, Description = "Student", Code = "S" }
            );

            modelBuilder.Entity<Theme>().HasData(
                new Theme { Id = 1, Description = "Light Blue", SortOrder = 1, IsActive = true },
                new Theme { Id = 2, Description = "Dark", SortOrder = 2, IsActive = false },
                new Theme { Id = 3, Description = "Dark Teal", SortOrder = 3, IsActive = true },
                new Theme { Id = 4, Description = "Light Green", SortOrder = 4, IsActive = true },
                new Theme { Id = 5, Description = "Dark Green", SortOrder = 5, IsActive = true }
            );

            modelBuilder.Entity<ThemeVariable>().HasData(
                new ThemeVariable { Id = 1, Description = "dropdownBackColor", GroupId = 1, SortOrder = 1 },
                new ThemeVariable { Id = 2, Description = "dropdownTextColor", GroupId = 1, SortOrder = 3 },
                new ThemeVariable { Id = 3, Description = "dropdownHoverBackColor", GroupId = 1, SortOrder = 4 },
                new ThemeVariable { Id = 4, Description = "dropdownHoverTextColor", GroupId = 1, SortOrder = 6 },
                new ThemeVariable { Id = 5, Description = "dropdownContentBackgroundColor", GroupId = 1, SortOrder = 7 },
                new ThemeVariable { Id = 6, Description = "dropdownContentTextColor", GroupId = 1, SortOrder = 9 },
                new ThemeVariable { Id = 7, Description = "textBoxLabelColor", GroupId = 2, SortOrder = 1 },
                new ThemeVariable { Id = 8, Description = "buttonBackgroundColor", GroupId = 3, SortOrder = 1 },
                new ThemeVariable { Id = 9, Description = "buttonTextColor", GroupId = 3, SortOrder = 3 },
                new ThemeVariable { Id = 10, Description = "buttonHoverBackgroundColor", GroupId = 3, SortOrder = 4 },
                new ThemeVariable { Id = 11, Description = "buttonHoverTextColor", GroupId = 3, SortOrder = 6 },
                new ThemeVariable { Id = 12, Description = "contentBackColor", GroupId = 4, SortOrder = 1 },
                new ThemeVariable { Id = 13, Description = "textBoxTextColor", GroupId = 2, SortOrder = 2 },
                new ThemeVariable { Id = 14, Description = "textBoxBackColor", GroupId = 2, SortOrder = 3 },
                new ThemeVariable { Id = 15, Description = "outsideBackColor", GroupId = 5, SortOrder = 1 },
                new ThemeVariable { Id = 16, Description = "textBoxBorderColor", GroupId = 2, SortOrder = 5 },
                new ThemeVariable { Id = 17, Description = "dropdownBackColorGradient", GroupId = 1, SortOrder = 2 },
                new ThemeVariable { Id = 18, Description = "dropdownHoverBackColorGradient", GroupId = 1, SortOrder = 5 },
                new ThemeVariable { Id = 19, Description = "dropdownContentBackgroundColorGradient", GroupId = 1, SortOrder = 8 },
                new ThemeVariable { Id = 20, Description = "buttonBackgroundColorGradient", GroupId = 3, SortOrder = 2 },
                new ThemeVariable { Id = 21, Description = "buttonHoverBackgroundColorGradient", GroupId = 3, SortOrder = 5 },
                new ThemeVariable { Id = 22, Description = "contentBackColorGradient", GroupId = 4, SortOrder = 2 },
                new ThemeVariable { Id = 23, Description = "textBoxBackColorGradient", GroupId = 2, SortOrder = 4 },
                new ThemeVariable { Id = 24, Description = "outsideBackColorGradient", GroupId = 5, SortOrder = 2 },
                new ThemeVariable { Id = 25, Description = "contentHeaderBackColor", GroupId = 7, SortOrder = 1 },
                new ThemeVariable { Id = 26, Description = "contentHeaderBackColorGradient", GroupId = 7, SortOrder = 2 },
                new ThemeVariable { Id = 27, Description = "contentHeaderTextColor", GroupId = 7, SortOrder = 3 },
                new ThemeVariable { Id = 28, Description = "contentTextColor", GroupId = 7, SortOrder = 4 },
                new ThemeVariable { Id = 29, Description = "linkTextColor", GroupId = 7, SortOrder = 5 },
                new ThemeVariable { Id = 30, Description = "radioLabelColor", GroupId = 8, SortOrder = 1 },
                new ThemeVariable { Id = 31, Description = "radioHoverColor", GroupId = 8, SortOrder = 2 },
                new ThemeVariable { Id = 32, Description = "radioCheckColor", GroupId = 8, SortOrder = 3 },
                new ThemeVariable { Id = 33, Description = "dialogHeaderBackColor", GroupId = 9, SortOrder = 1 },
                new ThemeVariable { Id = 34, Description = "dialogHeaderBackColorGradient", GroupId = 9, SortOrder = 2 },
                new ThemeVariable { Id = 35, Description = "dialogHeaderTextColor", GroupId = 9, SortOrder = 3 },
                new ThemeVariable { Id = 36, Description = "dialogContentBackColor", GroupId = 9, SortOrder = 4 },
                new ThemeVariable { Id = 37, Description = "dialogContentBackColorGradient", GroupId = 9, SortOrder = 5 },
                new ThemeVariable { Id = 38, Description = "dialogContentTextColor", GroupId = 9, SortOrder = 6 },
                new ThemeVariable { Id = 39, Description = "sortableBorder", GroupId = 10, SortOrder = 1 },
                new ThemeVariable { Id = 40, Description = "sortableHighlightBackColor", GroupId = 10, SortOrder = 2 },
                new ThemeVariable { Id = 41, Description = "sortableHighlightBackColorGradient", GroupId = 10, SortOrder = 3 },
                new ThemeVariable { Id = 42, Description = "textBoxBorderColorSelected", GroupId = 2, SortOrder = 6 },
                new ThemeVariable { Id = 43, Description = "passwordIconColor", GroupId = 2, SortOrder = 7 }
            );

            //Seed ThemeVariableColors table

            modelBuilder.Entity<ThemeVariableColor>().HasData(
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 1, Color = "#0058f2" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 2, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 3, Color = "#0030a0" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 4, Color = "#FFFFFF" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 5, Color = "#0058f2" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 6, Color = "#FFFFFF" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 7, Color = "#0048d1" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 8, Color = "#0058f2" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 9, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 10, Color = "#0030a0" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 11, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 12, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 13, Color = "#000000" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 14, Color = "#A0C2FF" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 15, Color = "#f3f5f7" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 16, Color = "#0000ee" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 17, Color = "#3178dd" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 18, Color = "#0042b8" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 19, Color = "#3178dd" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 20, Color = "#3178dd" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 21, Color = "#0042b8" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 22, Color = "#efefef" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 23, Color = "#78AFFF" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 24, Color = "#e3e5e7" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 25, Color = "#0054ff" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 26, Color = "#1074ef" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 27, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 28, Color = "#0038a1" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 29, Color = "#0038a1" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 30, Color = "#0048d1" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 31, Color = "#003cb5" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 32, Color = "#0048d1" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 33, Color = "#0054ff" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 34, Color = "#1074ef" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 35, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 36, Color = "#c3c5c7" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 37, Color = "#b3b5b7" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 38, Color = "#00143f" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 39, Color = "#0048d1" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 40, Color = "#0048d1" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 41, Color = "#0058f2" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 42, Color = "#101010" },
                new ThemeVariableColor { ThemeId = 1, ThemeVariableId = 43, Color = "#000000" }
            );

            modelBuilder.Entity<ThemeVariableColor>().HasData(
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 1, Color = "#131210" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 2, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 3, Color = "#050302" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 4, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 5, Color = "#1f1e1c" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 6, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 7, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 8, Color = "#131210" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 9, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 10, Color = "#050302" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 11, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 12, Color = "#343434" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 13, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 14, Color = "#141414" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 15, Color = "#0c0a08" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 16, Color = "#18b5ea" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 17, Color = "#232220" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 18, Color = "#151312" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 19, Color = "#2f2e2c" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 20, Color = "#232220" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 21, Color = "#151312" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 22, Color = "#444444" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 23, Color = "#242424" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 24, Color = "#1c1a18" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 25, Color = "#131210" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 26, Color = "#232220" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 27, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 28, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 29, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 30, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 31, Color = "#bbbbbb" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 32, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 33, Color = "#131210" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 34, Color = "#232220" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 35, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 36, Color = "#acaaa8" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 37, Color = "#bcbab8" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 38, Color = "#000000" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 39, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 40, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 41, Color = "#dfdfdf" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 42, Color = "#FFFFFF" },
                new ThemeVariableColor { ThemeId = 2, ThemeVariableId = 43, Color = "#ffffff" }
            );

            modelBuilder.Entity<ThemeVariableColor>().HasData(
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 1, Color = "#0B5257" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 2, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 3, Color = "#0E3733" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 4, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 5, Color = "#0B5257" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 6, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 7, Color = "#00B0A0" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 8, Color = "#0B5257" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 9, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 10, Color = "#0E2723" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 11, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 12, Color = "#000000" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 13, Color = "#00B0A0" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 14, Color = "#0B4A4F" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 15, Color = "#0C0A08" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 16, Color = "#18b5ea" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 17, Color = "#123D3A" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 18, Color = "#0E3733" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 19, Color = "#1A3F3A" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 20, Color = "#1A3F3A" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 21, Color = "#0E3733" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 22, Color = "#101010" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 23, Color = "#242424" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 24, Color = "#1C1A18" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 25, Color = "#0B5257" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 26, Color = "#1A3F3A" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 27, Color = "#00B8A8" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 28, Color = "#00B0A0" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 29, Color = "#00B0A0" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 30, Color = "#00B0A0" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 31, Color = "#006D5B" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 32, Color = "#00B0A0" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 33, Color = "#0B5257" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 34, Color = "#1A3F3A" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 35, Color = "#00B8A8" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 36, Color = "#acaaa8" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 37, Color = "#bcbab8" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 38, Color = "#001205" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 39, Color = "#008080" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 40, Color = "#008080" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 41, Color = "#20a295" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 42, Color = "#FFFFFF" },
                new ThemeVariableColor { ThemeId = 3, ThemeVariableId = 43, Color = "#00B0A0" }
            );

            modelBuilder.Entity<ThemeVariableColor>().HasData(
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 1, Color = "#009837" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 2, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 3, Color = "#115543" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 4, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 5, Color = "#00751F" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 6, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 7, Color = "#009837" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 8, Color = "#009837" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 9, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 10, Color = "#115543" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 11, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 12, Color = "#f7fffe" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 13, Color = "#00321A" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 14, Color = "#31C74D" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 15, Color = "#fafefd" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 16, Color = "#008000" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 17, Color = "#10a847" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 18, Color = "#107847" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 19, Color = "#10a847" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 20, Color = "#10a847" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 21, Color = "#107847" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 22, Color = "#e7efee" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 23, Color = "#37B74D" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 24, Color = "#eaeeed" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 25, Color = "#009837" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 26, Color = "#10a847" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 27, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 28, Color = "#006327" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 29, Color = "#006327" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 30, Color = "#009837" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 31, Color = "#006235" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 32, Color = "#009837" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 33, Color = "#009837" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 34, Color = "#10a847" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 35, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 36, Color = "#cacecd" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 37, Color = "#babebd" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 38, Color = "#003225" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 39, Color = "#009837" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 40, Color = "#009837" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 41, Color = "#208255" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 42, Color = "#101010" },
                new ThemeVariableColor { ThemeId = 4, ThemeVariableId = 43, Color = "#00321A" }
            );

            modelBuilder.Entity<ThemeVariableColor>().HasData(
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 1, Color = "#0e7733" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 2, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 3, Color = "#073411" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 4, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 5, Color = "#0e7733" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 6, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 7, Color = "#00BF73" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 8, Color = "#0e7733" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 9, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 10, Color = "#073411" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 11, Color = "#ffffff" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 12, Color = "#000000" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 13, Color = "#00BF73" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 14, Color = "#0C4D40" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 15, Color = "#0c0a08" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 16, Color = "#18aa45" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 17, Color = "#184615" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 18, Color = "#0F3510" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 19, Color = "#184615" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 20, Color = "#184615" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 21, Color = "#0F3510" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 22, Color = "#101010" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 23, Color = "#242424" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 24, Color = "#1c1a18" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 25, Color = "#0e7733" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 26, Color = "#184615" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 27, Color = "#002225" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 28, Color = "#00BF73" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 29, Color = "#00BF73" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 30, Color = "#00BF73" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 31, Color = "#007235" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 32, Color = "#00BF73" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 33, Color = "#0e7733" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 34, Color = "#184615" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 35, Color = "#001A25" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 36, Color = "#acaaa8" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 37, Color = "#bcbab8" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 38, Color = "#001A25" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 39, Color = "#00BF73" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 40, Color = "#00BF73" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 41, Color = "#149F53" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 42, Color = "#FFFFFF" },
                new ThemeVariableColor { ThemeId = 5, ThemeVariableId = 43, Color = "#00BF73" }
            );

            modelBuilder.Entity<QuestionType>().HasData(
                new QuestionType { Id = 1, Description = "Multiple Choice", SortOrder = 1, IsActive = true },
                new QuestionType { Id = 2, Description = "True / False", SortOrder = 2, IsActive = false },
                new QuestionType { Id = 3, Description = "Open-Ended Numeric", SortOrder = 3, IsActive = false }
            );

            modelBuilder.Entity<Subject>().HasData(
                new Subject { Id = 1, Description = "English / Language Arts", SortOrder = 1, IsActive = true },
                new Subject { Id = 2, Description = "Math", SortOrder = 2, IsActive = true },
                new Subject { Id = 3, Description = "Science", SortOrder = 3, IsActive = true },
                new Subject { Id = 4, Description = "Social Studies", SortOrder = 4, IsActive = true },
                new Subject { Id = 5, Description = "Geography", SortOrder = 5, IsActive = true },
                new Subject { Id = 6, Description = "World Languages", SortOrder = 6, IsActive = true },
                new Subject { Id = 7, Description = "Computer Science", SortOrder = 7, IsActive = true },
                new Subject { Id = 8, Description = "Health", SortOrder = 8, IsActive = true }
            );


            //modelBuilder.Entity<Subject>().HasData(
            //    new Subject { Id = 1, Description = "Grades 1-3", SortOrder = 1, IsActive = true },
            //    new Subject { Id = 2, Description = "Grades 4-5", SortOrder = 2, IsActive = true },
            //    new Subject { Id = 3, Description = "Grades 6-8", SortOrder = 3, IsActive = true },
            //    new Subject { Id = 4, Description = "Algebra", SortOrder = 4, IsActive = true },
            //    new Subject { Id = 5, Description = "Geometry", SortOrder = 5, IsActive = true },
            //    new Subject { Id = 6, Description = "Pre Calculus", SortOrder = 6, IsActive = true },
            //    new Subject { Id = 7, Description = "Calculus", SortOrder = 7, IsActive = true },
            //    new Subject { Id = 8, Description = "Statistics", SortOrder = 8, IsActive = true },
            //    new Subject { Id = 9, Description = "Test Prep", SortOrder = 9, IsActive = true },
            //    new Subject { Id = 10, Description = "Applied Math", SortOrder = 10, IsActive = true },
            //    new Subject { Id = 11, Description = "Data and Probability", SortOrder = 11, IsActive = true }
            //);

            //modelBuilder.Entity<Category>().HasData(
            //    new Category { Id = 1, Description = "Addition", SortOrder = 1, IsActive = true },
            //    new Category { Id = 2, Description = "Subtraction", SortOrder = 2, IsActive = true },
            //    new Category { Id = 3, Description = "Multiplication", SortOrder = 3, IsActive = true },
            //    new Category { Id = 4, Description = "Division", SortOrder = 4, IsActive = true },
            //    new Category { Id = 5, Description = "Fractions", SortOrder = 5, IsActive = true },
            //    new Category { Id = 6, Description = "Decimals", SortOrder = 6, IsActive = true },
            //    new Category { Id = 7, Description = "Percents", SortOrder = 7, IsActive = true },
            //    new Category { Id = 8, Description = "Place Value", SortOrder = 8, IsActive = true },
            //    new Category { Id = 9, Description = "Number Patterns", SortOrder = 9, IsActive = true },
            //    new Category { Id = 10, Description = "Word Problems", SortOrder = 10, IsActive = true },
            //    new Category { Id = 11, Description = "Measurement", SortOrder = 11, IsActive = true },
            //    new Category { Id = 12, Description = "Time", SortOrder = 12, IsActive = true },
            //    new Category { Id = 13, Description = "Money", SortOrder = 13, IsActive = true },
            //    new Category { Id = 14, Description = "Geometry Concepts", SortOrder = 14, IsActive = true },
            //    new Category { Id = 15, Description = "Algebraic Thinking", SortOrder = 15, IsActive = true },
            //    new Category { Id = 16, Description = "Data Interpretation", SortOrder = 16, IsActive = true },
            //    new Category { Id = 17, Description = "Probability", SortOrder = 17, IsActive = true },
            //    new Category { Id = 18, Description = "Graphs & Charts", SortOrder = 18, IsActive = true },
            //    new Category { Id = 19, Description = "Order of Operations", SortOrder = 19, IsActive = true },
            //    new Category { Id = 20, Description = "Equations & Expressions", SortOrder = 20, IsActive = true },
            //    new Category { Id = 21, Description = "Linear Equations", SortOrder = 21, IsActive = true },
            //    new Category { Id = 22, Description = "Inequalities", SortOrder = 22, IsActive = true },
            //    new Category { Id = 23, Description = "Systems of Equations", SortOrder = 23, IsActive = true },
            //    new Category { Id = 24, Description = "Exponents & Powers", SortOrder = 24, IsActive = true },
            //    new Category { Id = 25, Description = "Polynomials", SortOrder = 25, IsActive = true },
            //    new Category { Id = 26, Description = "Factoring", SortOrder = 26, IsActive = true },
            //    new Category { Id = 27, Description = "Quadratic Equations", SortOrder = 27, IsActive = true },
            //    new Category { Id = 28, Description = "Rational Expressions", SortOrder = 28, IsActive = true },
            //    new Category { Id = 29, Description = "Functions & Graphs", SortOrder = 29, IsActive = true },
            //    new Category { Id = 30, Description = "Angles & Lines", SortOrder = 30, IsActive = true },
            //    new Category { Id = 31, Description = "Triangles", SortOrder = 31, IsActive = true },
            //    new Category { Id = 32, Description = "Quadrilaterals", SortOrder = 32, IsActive = true },
            //    new Category { Id = 33, Description = "Circles", SortOrder = 33, IsActive = true },
            //    new Category { Id = 34, Description = "Area & Perimeter", SortOrder = 34, IsActive = true },
            //    new Category { Id = 35, Description = "Volume & Surface Area", SortOrder = 35, IsActive = true },
            //    new Category { Id = 36, Description = "Coordinate Geometry", SortOrder = 36, IsActive = true },
            //    new Category { Id = 37, Description = "Transformations", SortOrder = 37, IsActive = true },
            //    new Category { Id = 38, Description = "Proofs & Reasoning", SortOrder = 38, IsActive = true },
            //    new Category { Id = 39, Description = "Limits & Continuity", SortOrder = 39, IsActive = true },
            //    new Category { Id = 40, Description = "Derivatives", SortOrder = 40, IsActive = true },
            //    new Category { Id = 41, Description = "Applications of Derivatives", SortOrder = 41, IsActive = true },
            //    new Category { Id = 42, Description = "Integrals", SortOrder = 42, IsActive = true },
            //    new Category { Id = 43, Description = "Applications of Integrals", SortOrder = 43, IsActive = true },
            //    new Category { Id = 44, Description = "Differential Equations", SortOrder = 44, IsActive = true },
            //    new Category { Id = 45, Description = "Sequences & Series", SortOrder = 45, IsActive = true }
            //);

            modelBuilder.Entity<SymbolCategory>().HasData(
                new SymbolCategory { Id = 1, Description = "Basic Operators", SortOrder = 1, IsActive = true },
                new SymbolCategory { Id = 2, Description = "Algebra", SortOrder = 2, IsActive = true },
                new SymbolCategory { Id = 3, Description = "Fractions & Radicals", SortOrder = 3, IsActive = true },
                new SymbolCategory { Id = 4, Description = "Inequalities", SortOrder = 4, IsActive = true },
                new SymbolCategory { Id = 5, Description = "Greek Letters", SortOrder = 5, IsActive = true },
                new SymbolCategory { Id = 6, Description = "Geometry", SortOrder = 6, IsActive = true },
                new SymbolCategory { Id = 7, Description = "Calculus", SortOrder = 7, IsActive = true },
                new SymbolCategory { Id = 8, Description = "Set Theory & Logic", SortOrder = 8, IsActive = true },
                new SymbolCategory { Id = 9, Description = "Arrows", SortOrder = 9, IsActive = true },
                new SymbolCategory { Id = 10, Description = "Miscellaneous", SortOrder = 10, IsActive = true }
            );

            modelBuilder.Entity<SymbolLibrary>().HasData(
                // CATEGORY 1 — BASIC OPERATORS
                new SymbolLibrary { Id = 1, Name = "Plus", UnicodeValue = "+", LatexValue = null, CategoryId = 1, Description = "Addition operator", AssetPath = null, SortOrder = 1, IsActive = true },
                new SymbolLibrary { Id = 2, Name = "Minus", UnicodeValue = "−", LatexValue = null, CategoryId = 1, Description = "Subtraction operator", AssetPath = null, SortOrder = 2, IsActive = true },
                new SymbolLibrary { Id = 3, Name = "Multiply", UnicodeValue = "×", LatexValue = "\\times", CategoryId = 1, Description = "Multiplication sign", AssetPath = null, SortOrder = 3, IsActive = true },
                new SymbolLibrary { Id = 4, Name = "Divide", UnicodeValue = "÷", LatexValue = "\\div", CategoryId = 1, Description = "Division sign", AssetPath = null, SortOrder = 4, IsActive = true },
                new SymbolLibrary { Id = 5, Name = "Equals", UnicodeValue = "=", LatexValue = null, CategoryId = 1, Description = "Equality sign", AssetPath = null, SortOrder = 5, IsActive = true },
                new SymbolLibrary { Id = 6, Name = "NotEqual", UnicodeValue = "≠", LatexValue = "\\neq", CategoryId = 1, Description = "Not equal sign", AssetPath = null, SortOrder = 6, IsActive = true },
                new SymbolLibrary { Id = 7, Name = "DotOperator", UnicodeValue = "·", LatexValue = "\\cdot", CategoryId = 1, Description = "Dot multiplication", AssetPath = null, SortOrder = 7, IsActive = true },
                new SymbolLibrary { Id = 8, Name = "Percent", UnicodeValue = "%", LatexValue = null, CategoryId = 1, Description = "Percent symbol", AssetPath = null, SortOrder = 8, IsActive = true },

                // CATEGORY 2 — ALGEBRA
                new SymbolLibrary { Id = 9, Name = "LeftParen", UnicodeValue = "(", LatexValue = null, CategoryId = 2, Description = "Left parenthesis", AssetPath = null, SortOrder = 1, IsActive = true },
                new SymbolLibrary { Id = 10, Name = "RightParen", UnicodeValue = ")", LatexValue = null, CategoryId = 2, Description = "Right parenthesis", AssetPath = null, SortOrder = 2, IsActive = true },
                new SymbolLibrary { Id = 11, Name = "LeftBracket", UnicodeValue = "[", LatexValue = null, CategoryId = 2, Description = "Left bracket", AssetPath = null, SortOrder = 3, IsActive = true },
                new SymbolLibrary { Id = 12, Name = "RightBracket", UnicodeValue = "]", LatexValue = null, CategoryId = 2, Description = "Right bracket", AssetPath = null, SortOrder = 4, IsActive = true },
                new SymbolLibrary { Id = 13, Name = "LeftBrace", UnicodeValue = "{", LatexValue = "\\{", CategoryId = 2, Description = "Left brace", AssetPath = null, SortOrder = 5, IsActive = true },
                new SymbolLibrary { Id = 14, Name = "RightBrace", UnicodeValue = "}", LatexValue = "\\}", CategoryId = 2, Description = "Right brace", AssetPath = null, SortOrder = 6, IsActive = true },
                new SymbolLibrary { Id = 15, Name = "AbsoluteValue", UnicodeValue = null, LatexValue = null, CategoryId = 2, Description = "Absolute value", AssetPath = null, SortOrder = 7, IsActive = true },
                new SymbolLibrary { Id = 16, Name = "Exponent", UnicodeValue = null, LatexValue = null, CategoryId = 2, Description = "Exponent template", AssetPath = null, SortOrder = 8, IsActive = true },
                new SymbolLibrary { Id = 17, Name = "Subscript", UnicodeValue = null, LatexValue = null, CategoryId = 2, Description = "Subscript template", AssetPath = null, SortOrder = 9, IsActive = true },

                // CATEGORY 3 — FRACTIONS & RADICALS
                new SymbolLibrary { Id = 18, Name = "SquareRoot", UnicodeValue = "√", LatexValue = "\\sqrt{}", CategoryId = 3, Description = "Square root", AssetPath = null, SortOrder = 1, IsActive = true },
                new SymbolLibrary { Id = 19, Name = "CubeRoot", UnicodeValue = "∛", LatexValue = "\\sqrt[3]{}", CategoryId = 3, Description = "Cube root", AssetPath = null, SortOrder = 2, IsActive = true },
                new SymbolLibrary { Id = 20, Name = "Fraction", UnicodeValue = null, LatexValue = null, CategoryId = 3, Description = "Fraction template", AssetPath = null, SortOrder = 3, IsActive = true },
                new SymbolLibrary { Id = 21, Name = "MixedNumber", UnicodeValue = null, LatexValue = null, CategoryId = 3, Description = "Mixed number", AssetPath = null, SortOrder = 4, IsActive = true },
                new SymbolLibrary { Id = 22, Name = "NthRoot", UnicodeValue = null, LatexValue = null, CategoryId = 3, Description = "Nth‑root template", AssetPath = null, SortOrder = 5, IsActive = true },

                // CATEGORY 4 — INEQUALITIES
                new SymbolLibrary { Id = 23, Name = "LessThan", UnicodeValue = "<", LatexValue = null, CategoryId = 4, Description = "Less‑than sign", AssetPath = null, SortOrder = 1, IsActive = true },
                new SymbolLibrary { Id = 24, Name = "GreaterThan", UnicodeValue = ">", LatexValue = null, CategoryId = 4, Description = "Greater‑than sign", AssetPath = null, SortOrder = 2, IsActive = true },
                new SymbolLibrary { Id = 25, Name = "LessEqual", UnicodeValue = "≤", LatexValue = "\\le", CategoryId = 4, Description = "Less or equal", AssetPath = null, SortOrder = 3, IsActive = true },
                new SymbolLibrary { Id = 26, Name = "GreaterEqual", UnicodeValue = "≥", LatexValue = "\\ge", CategoryId = 4, Description = "Greater or equal", AssetPath = null, SortOrder = 4, IsActive = true },
                new SymbolLibrary { Id = 27, Name = "Approximately", UnicodeValue = "≈", LatexValue = "\\approx", CategoryId = 4, Description = "Approximate sign", AssetPath = null, SortOrder = 5, IsActive = true },
                new SymbolLibrary { Id = 28, Name = "Congruent", UnicodeValue = "≅", LatexValue = "\\cong", CategoryId = 4, Description = "Congruent sign", AssetPath = null, SortOrder = 6, IsActive = true },

                // CATEGORY 5 — GREEK LETTERS
                new SymbolLibrary { Id = 29, Name = "Alpha", UnicodeValue = "α", LatexValue = "\\alpha", CategoryId = 5, Description = "Greek letter alpha", AssetPath = null, SortOrder = 1, IsActive = true },
                new SymbolLibrary { Id = 30, Name = "Beta", UnicodeValue = "β", LatexValue = "\\beta", CategoryId = 5, Description = "Greek letter beta", AssetPath = null, SortOrder = 2, IsActive = true },
                new SymbolLibrary { Id = 31, Name = "Gamma", UnicodeValue = "γ", LatexValue = "\\gamma", CategoryId = 5, Description = "Greek letter gamma", AssetPath = null, SortOrder = 3, IsActive = true },
                new SymbolLibrary { Id = 32, Name = "Theta", UnicodeValue = "θ", LatexValue = "\\theta", CategoryId = 5, Description = "Greek letter theta", AssetPath = null, SortOrder = 4, IsActive = true },
                new SymbolLibrary { Id = 33, Name = "Lambda", UnicodeValue = "λ", LatexValue = "\\lambda", CategoryId = 5, Description = "Greek letter lambda", AssetPath = null, SortOrder = 5, IsActive = true },
                new SymbolLibrary { Id = 34, Name = "Mu", UnicodeValue = "μ", LatexValue = "\\mu", CategoryId = 5, Description = "Greek letter mu", AssetPath = null, SortOrder = 6, IsActive = true },
                new SymbolLibrary { Id = 35, Name = "Pi", UnicodeValue = "π", LatexValue = "\\pi", CategoryId = 5, Description = "Greek letter pi", AssetPath = null, SortOrder = 7, IsActive = true },
                new SymbolLibrary { Id = 36, Name = "Omega", UnicodeValue = "Ω", LatexValue = "\\Omega", CategoryId = 5, Description = "Greek letter omega", AssetPath = null, SortOrder = 8, IsActive = true },

                // CATEGORY 6 — GEOMETRY
                new SymbolLibrary { Id = 37, Name = "Angle", UnicodeValue = "∠", LatexValue = "\\angle", CategoryId = 6, Description = "Angle symbol", AssetPath = null, SortOrder = 1, IsActive = true },
                new SymbolLibrary { Id = 38, Name = "Degree", UnicodeValue = "°", LatexValue = "^\\circ", CategoryId = 6, Description = "Degree symbol", AssetPath = null, SortOrder = 2, IsActive = true },
                new SymbolLibrary { Id = 39, Name = "Perpendicular", UnicodeValue = "⟂", LatexValue = "\\perp", CategoryId = 6, Description = "Perpendicular sign", AssetPath = null, SortOrder = 3, IsActive = true },
                new SymbolLibrary { Id = 40, Name = "Parallel", UnicodeValue = "∥", LatexValue = "\\parallel", CategoryId = 6, Description = "Parallel sign", AssetPath = null, SortOrder = 4, IsActive = true },
                new SymbolLibrary { Id = 41, Name = "Triangle", UnicodeValue = "△", LatexValue = "\\triangle", CategoryId = 6, Description = "Triangle symbol", AssetPath = null, SortOrder = 5, IsActive = true },
                new SymbolLibrary { Id = 42, Name = "Square", UnicodeValue = "□", LatexValue = null, CategoryId = 6, Description = "Square symbol", AssetPath = null, SortOrder = 6, IsActive = true },

                // CATEGORY 7 — CALCULUS
                new SymbolLibrary { Id = 43, Name = "Integral", UnicodeValue = "∫", LatexValue = "\\int", CategoryId = 7, Description = "Integral sign", AssetPath = null, SortOrder = 1, IsActive = true },
                new SymbolLibrary { Id = 44, Name = "Summation", UnicodeValue = "∑", LatexValue = "\\sum", CategoryId = 7, Description = "Summation sign", AssetPath = null, SortOrder = 2, IsActive = true },
                new SymbolLibrary { Id = 45, Name = "Product", UnicodeValue = "∏", LatexValue = "\\prod", CategoryId = 7, Description = "Product sign", AssetPath = null, SortOrder = 3, IsActive = true },
                new SymbolLibrary { Id = 46, Name = "Limit", UnicodeValue = null, LatexValue = "\\lim", CategoryId = 7, Description = "Limit operator", AssetPath = null, SortOrder = 4, IsActive = true },
                new SymbolLibrary { Id = 47, Name = "Derivative", UnicodeValue = null, LatexValue = null, CategoryId = 7, Description = "Derivative template", AssetPath = null, SortOrder = 5, IsActive = true },
                new SymbolLibrary { Id = 48, Name = "IntegralTemplate", UnicodeValue = null, LatexValue = null, CategoryId = 7, Description = "Integral template", AssetPath = null, SortOrder = 6, IsActive = true },

                // CATEGORY 8 — SET THEORY & LOGIC
                new SymbolLibrary { Id = 49, Name = "ElementOf", UnicodeValue = "∈", LatexValue = "\\in", CategoryId = 8, Description = "Element of", AssetPath = null, SortOrder = 1, IsActive = true },
                new SymbolLibrary { Id = 50, Name = "NotElementOf", UnicodeValue = "∉", LatexValue = "\\notin", CategoryId = 8, Description = "Not element of", AssetPath = null, SortOrder = 2, IsActive = true },
                new SymbolLibrary { Id = 51, Name = "Union", UnicodeValue = "∪", LatexValue = "\\cup", CategoryId = 8, Description = "Union of sets", AssetPath = null, SortOrder = 3, IsActive = true },
                new SymbolLibrary { Id = 52, Name = "Intersection", UnicodeValue = "∩", LatexValue = "\\cap", CategoryId = 8, Description = "Intersection of sets", AssetPath = null, SortOrder = 4, IsActive = true },
                new SymbolLibrary { Id = 53, Name = "Subset", UnicodeValue = "⊂", LatexValue = "\\subset", CategoryId = 8, Description = "Proper subset", AssetPath = null, SortOrder = 5, IsActive = true },
                new SymbolLibrary { Id = 54, Name = "SubsetEqual", UnicodeValue = "⊆", LatexValue = "\\subseteq", CategoryId = 8, Description = "Subset or equal", AssetPath = null, SortOrder = 6, IsActive = true },
                new SymbolLibrary { Id = 55, Name = "ForAll", UnicodeValue = "∀", LatexValue = "\\forall", CategoryId = 8, Description = "Universal quantifier", AssetPath = null, SortOrder = 7, IsActive = true },
                new SymbolLibrary { Id = 56, Name = "Exists", UnicodeValue = "∃", LatexValue = "\\exists", CategoryId = 8, Description = "Existential quantifier", AssetPath = null, SortOrder = 8, IsActive = true },
                new SymbolLibrary { Id = 57, Name = "Implies", UnicodeValue = "⇒", LatexValue = "\\Rightarrow", CategoryId = 8, Description = "Implies symbol", AssetPath = null, SortOrder = 9, IsActive = true },
                new SymbolLibrary { Id = 58, Name = "Iff", UnicodeValue = "⇔", LatexValue = "\\Leftrightarrow", CategoryId = 8, Description = "If and only if", AssetPath = null, SortOrder = 10, IsActive = true },

                // CATEGORY 9 — ARROWS
                new SymbolLibrary { Id = 59, Name = "RightArrow", UnicodeValue = "→", LatexValue = "\\to", CategoryId = 9, Description = "Right arrow", AssetPath = null, SortOrder = 1, IsActive = true },
                new SymbolLibrary { Id = 60, Name = "LeftArrow", UnicodeValue = "←", LatexValue = "\\leftarrow", CategoryId = 9, Description = "Left arrow", AssetPath = null, SortOrder = 2, IsActive = true },
                new SymbolLibrary { Id = 61, Name = "DoubleArrow", UnicodeValue = "↔", LatexValue = "\\leftrightarrow", CategoryId = 9, Description = "Two‑way arrow", AssetPath = null, SortOrder = 3, IsActive = true },
                new SymbolLibrary { Id = 62, Name = "MapsTo", UnicodeValue = "↦", LatexValue = "\\mapsto", CategoryId = 9, Description = "Maps‑to arrow", AssetPath = null, SortOrder = 4, IsActive = true },

                // CATEGORY 10 — MISCELLANEOUS
                new SymbolLibrary { Id = 63, Name = "Infinity", UnicodeValue = "∞", LatexValue = "\\infty", CategoryId = 10, Description = "Infinity symbol", AssetPath = null, SortOrder = 1, IsActive = true },
                new SymbolLibrary { Id = 64, Name = "Factorial", UnicodeValue = "!", LatexValue = null, CategoryId = 10, Description = "Factorial symbol", AssetPath = null, SortOrder = 2, IsActive = true },
                new SymbolLibrary { Id = 65, Name = "Composition", UnicodeValue = "∘", LatexValue = "\\circ", CategoryId = 10, Description = "Function composition", AssetPath = null, SortOrder = 3, IsActive = true }
);


        }
    }
}
