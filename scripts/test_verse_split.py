import re

sample1 = '15Perhatikanlah, supaya jangan ada orang yang membalas yang jahat dengan yang ajahat, tetapi usahakanlah 1senantiasa yang bbaik, terhadap kamu cmasing-masing dan terhadap semua orang.'
sample2 = 'Ia yang amemanggil kamu adalah bsetia, Ia juga akan menggenapinya. 25Saudara-saudara, adoakanlah kami.'
sample3 = 'Setiap orang yang lahir dari Allah, tidak terus-menerus berbuat dosa; sebab benih ilahi btetap ada di dalam dia dan ia tidak dapat terus-menerus berbuat dosa, karena ia telah lahir dari Allah. 10Inilah tandanya anak-anak Allah dan anak-anak Iblis: setiap orang yang tidak berbuat kebenaran, tidak berasal dari Allah, demikian juga barangsiapa yang tidak amengasihi saudaranya.'

# Test splitting
m_start = re.match(r'^(\d{1,3})(?:\s+|(?=[a-zA-Z]))(.+)', sample1)
print("sample1 match:", m_start.group(1), repr(m_start.group(2)[:30]))

# Test inline split
m_inline = re.search(r'([\.\;\!\?])\s*(\d{1,3})([A-Z][a-zA-Z]+.+)', sample2)
if m_inline:
    print("sample2 inline:", m_inline.group(2), repr(m_inline.group(3)))

m_inline2 = re.search(r'([\.\;\!\?])\s*(\d{1,3})([A-Z][a-zA-Z]+.+)', sample3)
if m_inline2:
    print("sample3 inline:", m_inline2.group(2), repr(m_inline2.group(3)))
