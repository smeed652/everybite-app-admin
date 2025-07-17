# Clean, minimal zsh config for development

# Basic shell options
setopt AUTO_CD
setopt EXTENDED_GLOB
setopt NO_CASE_GLOB
setopt NUMERIC_GLOB_SORT
setopt PROMPT_SUBST

# History
HISTFILE=~/.zsh_history
HISTSIZE=1000
setopt SHARE_HISTORY
setopt APPEND_HISTORY
setopt EXTENDED_HISTORY

# AWS Profile
export AWS_PROFILE=everybite-admin

# Path
export PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

# Aliases
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# Git aliases
alias gs=git status'
alias ga=git add'
alias gc=git commit'
alias gp='git push'
alias gl=git log --oneline'
alias gco='git checkout'
alias gcb='git checkout -b'

# Node/npm aliases
alias n='npm'
alias ni='npm install'
alias nid='npm install --save-dev'
alias nr='npm run

# Simple prompt
PROMPT='%F{green}%n@%m%f:%F{blue}%~%f$ '

# Basic completion
autoload -Uz compinit
compinit

# Key bindings
bindkey -e
bindkey ^[[A history-substring-search-up
bindkey ^[[B history-substring-search-down

# Environment variables
export EDITOR='code'
export VISUAL='code' 