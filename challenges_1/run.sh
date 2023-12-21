#!/bin/bash

# check if the INPUT environment variable is "sanity check"
if [ "$INPUT" = "sanity check" ]; then
    echo 'Answer is correct, congratulations!'
    exit 0
else
    echo "Answer is not correct: expected 'sanity check', got '$INPUT'"
    exit 1
fi