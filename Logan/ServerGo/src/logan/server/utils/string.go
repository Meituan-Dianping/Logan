package utils

import "strconv"

func IsAllNotEmpty(strs ...string) bool {
	for _, str := range strs {
		if str == "" {
			return false
		}
	}
	return true
}

func UrlDecode(s string) string {
	needToChange := false
	numChars := len(s)
	var i = 0
	var c byte
	result := ""
	var bytes []byte
	for i < numChars {
		c = s[i]
		switch c {
		case '+':
			result += " "
			i++
			needToChange = true
			break
		case '%':
			if bytes == nil {
				bytes = make([]byte, (numChars-i)/3)
			}
			pos := 0
			for (i+2 < numChars) && (c == '%') {
				v, _ := strconv.ParseInt(s[i+1:i+3], 16, 32)
				//                        int v = Integer.parseInt(s.substring(i+1,i+3),16);
				bytes[pos] = byte(v)
				pos++
				i += 3
				if i < numChars {
					c = s[i]
				}
			}

			if (i < numChars) && (c == '%') {

				//                        throw new IllegalArgumentException(
				//                         "URLDecoder: Incomplete trailing escape (%) pattern");
			}

			result += string(bytes[:pos])
			needToChange = true
			break
		default:
			result += string(c)
			i++
			break
		}
	}
	if needToChange {
		return result
	} else {
		return s
	}
}
