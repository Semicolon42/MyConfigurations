# **Sources** 
Olivier Lacan - https://gist.github.com/olivierlacan/3237765

# Aliases

```
git config --global alias.hist "log --pretty=format:'%h %ad | %s%d [%an]' --graph --date=short"
git config --global alias.lol "log --graph --decorate --pretty=oneline --abbrev-commit --all"
git config --global alias.mylog "log --pretty=format:'%h %s [%an]' --graph"
```

To check that they've been added correctly, first run `git config --list`. You should see something like this in the midst of all your other configuration:

```
alias.hist=log --pretty=format:"%h %ad | %s%d [%an]" --graph --date=short
alias.lol=log --graph --decorate --pretty=oneline --abbrev-commit --all
alias.mylog=log --pretty=format:'%h %s [%an]' --graph
```

Then the output of each should look like this.

## Hist

```
* f164e73 2012-08-01 | Enroll button doesn't say free (HEAD, production/master, origin/master, origin/HEAD, master) [Dan Denney]
* 2192f52 2012-08-01 | Remove free play off [Adam Rensel]
* ea5ee21 2012-07-29 | Added in video download links to level pages (closes #72) [Eric Allam]
* bebb867 2012-07-27 | Fixed the course name [Eric Allam]
* 96e110e 2012-07-28 | Use double quotes so we don't get username conflicts with people who have hyphens in there names [Adam Rensel]
* 7c7f019 2012-07-27 | level nav says 'challenges' instead of 'level' for status [Dan Denney]
* 10ddfcd 2012-07-27 | All rebase related attempts will output the same error message [Adam Rensel]
```

## LOL

```
* f164e73 (HEAD, production/master, origin/master, origin/HEAD, master) Enroll button doesn't say free
* 2192f52 Remove free play off
* ea5ee21 Added in video download links to level pages (closes #72)
* bebb867 Fixed the course name
* 96e110e Use double quotes so we don't get username conflicts with people who have hyphens in there names
* 7c7f019 level nav says 'challenges' instead of 'level' for status
* 10ddfcd All rebase related attempts will output the same error message
```

## MyLog

```
* f164e73 Enroll button doesn't say free [Dan Denney]
* 2192f52 Remove free play off [Adam Rensel]
* ea5ee21 Added in video download links to level pages (closes #72) [Eric Allam]
* bebb867 Fixed the course name [Eric Allam]
* 96e110e Use double quotes so we don't get username conflicts with people who have hyphens in there names [Adam Rensel]
* 7c7f019 level nav says 'challenges' instead of 'level' for status [Dan Denney]
* 10ddfcd All rebase related attempts will output the same error message [Adam Rensel]
```
